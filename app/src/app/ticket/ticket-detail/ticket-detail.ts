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
  styleUrls: ['./ticket-detail.css']
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
  private imageDialog = inject(MatDialog);

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

 /**
  * Función para formatear una fecha en formato DD/MM/AAAA hh:mm AM/PM
  * que recibe la fecha como parámetro 
  * @param fecha 
  * @returns 
  */

  // Fecha en formato DD/MM/AAAA hh:mm AM/PM
  fechaFormateada(fecha: Date | null | undefined): string {

    // Crear un objeto Date a partir del parámetro fecha
    const fechaAFormatear = new Date(fecha || '');

    // Si no hay fecha, retornar cadena vacía
    if (!fechaAFormatear || isNaN(fechaAFormatear.getTime())) return '';

    // Formatear la fecha a DD/MM/AAAA
    const dia = String(fechaAFormatear.getDate()).padStart(2, '0');
    const mes = String(fechaAFormatear.getMonth() + 1).padStart(2, '0');
    const anio = fechaAFormatear.getFullYear();

    // Formatear la hora a hh:mm AM/PM
    let horas = fechaAFormatear.getHours();
    const minutos = String(fechaAFormatear.getMinutes()).padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    horas = horas ? horas : 12; // la hora '0' debe ser '12'
    const horasFormateadas = String(horas).padStart(2, '0');

    // Retornar la fecha y hora formateada
    return `${dia}/${mes}/${anio} ${horasFormateadas}:${minutos} ${ampm}`;
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

  // Signal compuetado para mostrar tiempo de resolución en días (horas y minutos si es menor a 1 día)
  tiempoResolucion = computed(() => {

    // Obtener la fecha de resolución (priorizando resueltoAt, ya que está relacionado con el SLA de resolución)
    const resuelto = this.resueltoAt();

    // Obtener la fecha de cierre del ticket
    // const cierre = this.cerradoAt();

    // Obtener la fecha de creación del ticket
    const creado = this.creadoAt();

    // Configurar la fecha de resolución con la fecha de resolución del ticket 
    const fechaResolucion = resuelto;

    // Si no hay fecha de resolución, retornar null
    if (!fechaResolucion) return null;

    // Calcular la diferencia entre la fechaResolucion y la fecha de creación en milisegundos
    const diffMs = fechaResolucion.getTime() - creado!.getTime();

    // Obtener dias, horas y minutos desde diffMs
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHoras = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // Si los dias obtenidos es mayor 0 (1 o más) mostrar solo dias
    if (diffDias > 0) {

      // Ejemplo de salida: "3 días"
      return `${diffDias} día${diffDias > 1 ? 's' : ''}`;
    }

    // Si no tiene dias (dias = 0), mostrar horas y minutos
    if (diffDias === 0) {

      // Si tiene horas, mostrar horas y minutos
      if (diffHoras > 0) {

        // Ejemplo de salida: "3 horas 15 minutos"
        return `0 (${diffHoras} hr${diffHoras > 1 ? 's' : ''} ${diffMinutos} min${diffMinutos !== 1 ? 's' : ''})`;
      }
    }

    // Si es menos de una hora, mostrar solo minutos
    return `${diffMinutos} min${diffMinutos === 1 ? '' : 's'}`;

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

    // Si no hay fecha límite de resolución => incumplido (retornar false)
    if (!limite) return false;

    // Retornar true/false según el cálculo de cumplimiento
    return resuelto.getTime() <= limite.getTime();
  });

  /**
   * Método para obtener el ícono correspondiente al estado del ticket
   * @param estado - Estado actual del ticket
   * @returns Nombre del ícono de Material Icons
   */
  getStatusIcon(estado: string | undefined): string {
    const iconMap: { [key: string]: string } = {
      'ABIERTO': 'lock_open',
      'EN_PROCESO': 'autorenew',
      'RESUELTO': 'check_circle',
      'CERRADO': 'lock'
    };
    return iconMap[estado || ''] || 'help_outline';
  }

  // Para regresar a la vista de lista de tickets
  goBack(): void {
    this.router.navigate(['/ticket/']);
  }

  // Signal computado para ordenar las entradas del historial por fecha (de más reciente a más antigua)
  historialOrdenado = computed(() => {
    // El backend ya devuelve ordenado por id ASC (cronológico)
    return this.datos()?.historiales || [];
  });

  // Metodo simple para obtener el URL base de las imágenes
  get baseImageUrl(): string {
    return 'http://localhost:3000/images/';
  }

  // Método para obtener las imágenes asociadas al historial del ticket 
  // Tipado fuerte para la imagen
  openImage(img: { url?: string } | null | undefined) {
    
    // Si no hay url de imagen, salir del método (no abrir el dialog)
    if (!img?.url) return;

    // Obtener la URL completa de la imagen y abrir el dialog
    const src = `http://localhost:3000/images/${img.url}`;
    this.imageDialog.open(TicketImageViewDialog, {
      data: { src },
      panelClass: 'img-dialog-panel'
    });
  }

}