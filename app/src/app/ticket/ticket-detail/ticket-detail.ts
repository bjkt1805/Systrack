import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketModel } from '../../share/models/TicketModel';
import { TicketService } from '../../share/services/api/ticket.service';
import { MatDialog } from '@angular/material/dialog';
import { TicketImageViewDialog } from '../ticket-image-view-dialog/ticket-image-view-dialog';

// importar dialogo de TicketEstado
// import {TicketEstadoDialog} from '../ticket-estado-dialog/ticket-estado-dialog';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { EstadoTicket } from '../../share/models/EnumsModel';

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
  private imageDialog = inject(MatDialog);

  // Inyectar el servicio de autenticación
  private authService = inject(AuthenticationService);

  /**
 * Signals para manejar la autenticación de usuario 
 */
  readonly isAuthenticated = this.authService.authenticated;
  readonly currentUser = this.authService.usuario;

  // Mapa para manejar el flujo de estados del estado
  // Por ejemplo, pasar de Pendiente a Asignado
  // Luego pasar de Asignado a En_Proceso, etc. 
  // Record ayuda a mapear un objeto mediante llave (EstadoTicket) y tipo de 
  // valor asociado a esas llaves (EstadoTicket[])
  private readonly FLUJO_ESTADOS: Record<EstadoTicket, EstadoTicket[]> = {
    [EstadoTicket.PENDIENTE]: [EstadoTicket.ASIGNADO],
    [EstadoTicket.ASIGNADO]: [EstadoTicket.EN_PROCESO],
    [EstadoTicket.EN_PROCESO]: [EstadoTicket.RESUELTO],
    [EstadoTicket.RESUELTO]: [EstadoTicket.CERRADO],
    [EstadoTicket.CERRADO]: []
  };

  // Mapa/record para los íconos de estado del tiquete 
  private readonly ESTADOS_ICONS: Record<string, string> = {
    'PENDIENTE': 'pending',
    'ASIGNADO': 'person_add',
    'EN_PROCESO': 'autorenew',
    'RESUELTO': 'check_circle',
    'CERRADO': 'lock'
  }

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

  // Obtener el ícono según el estado del tiquete
  getEstadoIcon(estado: string | undefined): string {
    return this.ESTADOS_ICONS[estado || ''] || 'help'; // retornar 
  }

  /**
   * Signal computada para verificar si el usuario puede actualizar el estado del ticket 
   */
  puedeActualizarEstado = computed(() => {

    // Obtener la información del tiquete (signal datos)
    const ticket = this.datos();

    // Obtener el usuario autenticado 
    const usuario = this.currentUser();

    // Si no hay tiquete ni usuario devolver false 
    if (!ticket || !usuario) return false;

    // Si el estado del tiquete es CERRADO, devolver false (no se puede actualizar)
    if (ticket.estado === EstadoTicket.CERRADO) return false;

    // Obtener los siguientes estados disponibles (basado en el estado actual del tiquete)
    // Por ejemplo, si el tiquete está en estado Pendiente, debe devolverse Asignado
    // En Proceso, Resuelto, Cerrado 
    const siguientesEstadosTicket = this.FLUJO_ESTADOS[ticket.estado as EstadoTicket] || [];

    // Si la longitud de "siguientesEstadosTicket" es 0 devolver false 
    if (siguientesEstadosTicket.length === 0) return false;

    // Verificar el permiso sobre el siguiente estado del tiquete 
    for (const siguienteEstado of siguientesEstadosTicket) {

      // Si el usuario tiene permiso para cambiar el estado del tiquete, devolver true
      if (this.tienePermisoParaEstado(siguienteEstado, ticket, usuario)) {
        return true;
      }
    }

    // Devolver false por defecto
    return false;
  });

  /**
   * Método para verificar si el usuario tiene permiso para cambiar a un estado específico
   */
  private tienePermisoParaEstado(estadoNuevo: EstadoTicket, ticket: TicketModel, usuario: any): boolean {

    // Obtener el id de usuario y el rol a partir del usuario 
    const { id: usuarioId, rol } = usuario;

    // SOLO LOS TÉCNICOS PUEDEN CAMBIAR EL TIQUETE A EN_PROCESO O RESUELTO
    // A partir del record FLUJO_ESTADOS se revisa si EstadoTicket 
    // es "EN_PROCESO" o "RESUELTO"
    if ([EstadoTicket.EN_PROCESO, EstadoTicket.RESUELTO].includes(estadoNuevo)) {

      // retornar true si el rol es TECNICO
      return rol === 'TECNICO';
    }

    // SOLO EL CLIENTE QUE CREÓ EL TIQUETE O EL ADMIN PUEDEN CERRARLO
    if (estadoNuevo === EstadoTicket.CERRADO) {

      //retornar true si el id de usuario es el del solicitanteId del tiquete 
      // o si el rol es ADMIN 
      return ticket.solicitanteId === usuarioId || rol === 'ADMIN'
    }

    // TÉCNICO O ADMIN PUEDEN CAMBIAR EL ESTADO DEL TIQUETE A ASIGNADO
    if (estadoNuevo === EstadoTicket.ASIGNADO) {

      // retornar true si el rol del usuario es TECNICO o ADMIN 
      return rol === 'TECNICO' || rol === 'ADMIN';
    }

    // devoler false por defecto
    return false;

  }

  /**
   * Método para abrir el diálogo de cambio de estado del ticket
   */
  abrirDialogoCambioEstado(): void {

    // Obtener el tiquete
    const ticket = this.datos();

    // Obtener el usuario autenticado
    const usuario = this.currentUser();

    // Si no hay tiquete o usuario, salir del método
    if (!ticket || !usuario) return;

    // Obtener los siguientes estados disponibles 
    const siguientesEstadosTicket = this.FLUJO_ESTADOS[ticket.estado as EstadoTicket] || [];

    // Filtrar los estados a los que el usuario tiene permiso para cambiar
    const estadosDisponibles = siguientesEstadosTicket.filter(estado =>
      this.tienePermisoParaEstado(estado, ticket, usuario) // invocar el método de permiso
    );

    // Si no hay estados disponibles, salir del método
    if (estadosDisponibles.length === 0) return;

    

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
