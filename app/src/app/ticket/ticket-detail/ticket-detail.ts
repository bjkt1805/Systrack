import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketModel } from '../../share/models/TicketModel';
import { TicketService } from '../../share/services/api/ticket.service';
import { MatDialog } from '@angular/material/dialog';
import { TicketImageViewDialog } from '../ticket-image-view-dialog/ticket-image-view-dialog';

@Component({
  selector: 'app-ticket-detail',
  standalone: false,
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css'
})
export class TicketDetail {

  // Signal para almacenar los datos del ticket
  datos = signal<TicketModel | null>(null);

  // Inyectar servicio para llamar al detalle del ticket
  private ticketService = inject(TicketService);

  // Para obtener el parámetro de la ruta 
  private route = inject(ActivatedRoute);

  // Para redireccionar
  private router = inject(Router);

  // Para mostrar un dialog con las imagenes del historial del ticket
  private imageDialog = inject (MatDialog);

  constructor() {

    // Para obtener el id/parámetro de la ruta
    // Parsear el id a número
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Validación básica del id y enviarlo como parámetro al método obtenerTicket
    if (!isNaN(id)) {
      this.obtenerTicket(id);
    }
  }

  // Obtener ticket y actualizar la Signal
  obtenerTicket(id: number) {
    this.ticketService.getById(id).subscribe((data: TicketModel) => {
      console.log(data);
      this.datos.set(data); // Actualiza la Signal
    });
  }

  // Fecha de creación del ticket en formato DD/MM/AAAA
  fechaCreacionFormateada(): string {
    const fecha = new Date(this.datos()?.creadoAt || '');

    // Formatear la fecha a DD/MM/AAAA
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();

    // Retornar la fecha formateada
    return `${dia}/${mes}/${anio}`;
  }

  // Función privada utilitaria para convertir cadenas de fecha a objetos Date
  private toDate(dateValue: string | Date | null | undefined): Date | null {
    if (!dateValue) return null;
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  }

  // SIGNALS COMPUTADOS PARA OBTENER FECHAS COMO OBJETOS Date

  // Signal computado de fecha de creación
  creadoAt = computed(() => this.toDate(this.datos()?.creadoAt));

  // Signal computado de fechaLimiteRespuesta
  fechaLimiteRespuesta = computed(() => this.toDate(this.datos()?.fechaLimiteRespuesta));

  // Signal computado de fechaLimiteResolucion
  fechaLimiteResolucion = computed(() => this.toDate(this.datos()?.fechaLimiteResolucion));

  // Signal computado de respondidoAt
  respondidoAt = computed(() => this.toDate(this.datos()?.respondidoAt));

  // Signal computado de resueltoAt
  resueltoAt = computed(() => this.toDate(this.datos()?.resueltoAt));

  // Signal computado de cerradoAt
  cerradoAt = computed(() => this.toDate(this.datos()?.cerradoAt));


  // ====================================
  // SIGNALS COMPUTADOS PARA CALCULAR 
  // LOS SIGUIENTES CAMPOS DERIVADOS: 
  // - DIAS DE RESOLUCION (SOLO SI EL TICKET ESTÁ RESUELTO O CERRADO)
  // - DIAS HASTA LA RESOLUCIÓN (SI EL TICKET NO ESTÁ RESUELTO)
  // - CUMPLIMIENTO DE RESPUESTA
  // - CUMPLIMIENTO DE RESOLUCIÓN
  // ====================================

  // Días de resolución - solo si el ticket está resuelto o cerrado
  diasResolucion = computed(() => {

    // Obtener el valor de cerradoAt y creadoAt (desde el signal "datos" que devuelve el objeto del ticket)
    const cierre = this.cerradoAt();
    const creado = this.creadoAt();

    // Si no existen las fechas, retornar null
    if (!cierre || !creado) return null;

    // Calcular la diferencia en milisegundos y convertir a días para mostrarlo como diasResolucion
    const diffMs = cierre.getTime() - creado.getTime();

    // Retornar la diferencia en días (redondeada hacia abajo)
    return Math.max(0, Math.floor(diffMs / 86_400_000));
  });


  // (OPCIONAL) Días hasta “resuelto” antes del cierre (mostrar con otra etiqueta)
  diasHastaResuelto = computed(() => {

    // Obtener el valor de resueltoAt y creadoAt (desde el signal "datos" que devuelve el objeto del ticket)
    const resuelto = this.resueltoAt();
    const creado = this.creadoAt();

    // Si no existen las fechas, retornar null
    if (!resuelto || !creado) return null;

    // Calcular la diferencia en milisegundos y convertir a días para mostrarlo como diasHastaResuelto
    const diffMs = resuelto.getTime() - creado.getTime();

    // Retornar la diferencia en días (redondeada hacia abajo)
    return Math.max(0, Math.floor(diffMs / 86_400_000));
  });

  // Cumplimiento de respuesta (signal computed fuertemente tipado )
  cumplioRespuesta = computed<null | boolean>(() => {

    // Obtener el valor de cumplioRespuesta desde la base de datos
    const cumplioRespuesta = this.datos()?.cumplioRespuesta;

    // Si el valor existe en la base de datos, retornarlo directamente
    if (cumplioRespuesta !== null && cumplioRespuesta !== undefined) return cumplioRespuesta;

    // Si el valor de cumplioRespuesta no está en la base de datos, calcularlo

    // Obtener la fecha de cierre del ticket
    const cierre = this.cerradoAt();

    // Si el ticket no tiene fecha de cierre, retornar null
    if (!cierre) return null;

    // Obtener la fecha de respuesta y la fecha límite de respuesta
    const respondido = this.respondidoAt();
    const limite = this.fechaLimiteRespuesta();

    // Si no hay fecha límite => incumplido (retornar false)
    if (!limite) return false;

    // Retornar true/false según el cálculo de cumplimiento
    return !!respondido && respondido.getTime() <= limite.getTime();
  });

  // Cumplimiento de resolución (signal computed fuertemente tipado )
  cumplioResolucion = computed<null | boolean>(() => {

    // Obtener el valor de cumplioResolucion desde la base de datos
    const cumplioResolucion = this.datos()?.cumplioResolucion;

    // Si el valor existe en la base de datos, retornarlo directamente
    if (cumplioResolucion !== null && cumplioResolucion !== undefined) return cumplioResolucion;

    // Si el valor de cumplioResolucion no está en la base de datos, calcularlo

    // Obtener la fecha de cierre del ticket
    const cierre = this.cerradoAt();

    // Si el ticket no tiene fecha de cierre, retornar null
    if (!cierre) return null;

    // Si la fecha de resolución es null, devolver la fecha de cierre como último recurso
    const resuelto = this.resueltoAt() ?? cierre; 

    // Obtener la fecha límite de resolución
    const limite = this.fechaLimiteResolucion();

    // Si no hay fecha límite => incumplido (retornar false)
    if (!limite) return false;

    // Retornar true/false según el cálculo de cumplimiento
    return resuelto.getTime() <= limite.getTime();
  });

  // Para regresar a la vista de lista de tickets
  goBack(): void {
    this.router.navigate(['/ticket/']);
  }

  // Signal computado para ordenar las entradas del historial por fecha (de más reciente a más antigua)
  historialOrdenado = computed(() => {

    // Obtener el historial del ticket. Si no existe, retornar un array vacío
    const historial = this.datos()?.historiales || [];

    // Retornar el historial ordenado por fecha (de más reciente a más antigua)
    return historial.slice().sort((a, b) => {

      // Obtener la fecha de creación como timestamp para comparar
      const fechaA = new Date(a.creadoAt).getTime();
      const fechaB = new Date(b.creadoAt).getTime();

      // Retornar la diferencia para ordenar (de más reciente a más antigua)
      return fechaB - fechaA;
    });
  })

  // Método para obtener las imágenes asociadas al historial del ticket 
  // Tipado fuerte para la imagen
  getImagenSrc(imagen: { url?: string; nombreArchivo?: string; path?: string } | null | undefined): string {
    
    // Si la imagen es nula o indefinida, retornar cadena vacía
    if (!imagen) return '';

    // Priorizar la URL directa si está disponible
    if (typeof imagen.url === 'string' && imagen.url.trim()) {
      return imagen.url;
    }

    // Construir la URL basada en nombreArchivo o path
    if (typeof imagen.nombreArchivo === 'string' && imagen.nombreArchivo.trim()) {
      return `http://localhost:3000/images/${imagen.nombreArchivo}`;
    }

    // Usar el path si está disponible
    if (typeof imagen.path === 'string' && imagen.path.trim()) {
      return `http://localhost:3000/${imagen.path}`;
    }

    // Si no hay información válida, retornar cadena vacía
    return '';
  }

  // Método para obtener las imágenes asociadas al historial del ticket 
  // Tipado fuerte para la imagen
  openImage(img: { url?: string; nombreArchivo?: string; path?: string } | null | undefined) {
    const src = this.getImagenSrc(img);
    if (!src) return;
    this.imageDialog.open(TicketImageViewDialog, { data: { src }, panelClass: 'img-dialog-panel' });
  }

}
