import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketModel } from '../../share/models/TicketModel';
import { TicketService } from '../../share/services/api/ticket.service';
import { MatDialog } from '@angular/material/dialog';
import { TicketImageViewDialog } from '../ticket-image-view-dialog/ticket-image-view-dialog';
import { NotificationService } from '../../share/services/app/notification.service';
import { TranslateService } from '@ngx-translate/core';

// importar dialogo de TicketEstado
import { TicketHistorialViewDialog } from '../ticket-historial-view-dialog/ticket-historial-view-dialog';
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
  private ticketDialog = inject(MatDialog);

  // Inyectar el servicio de autenticación
  private authService = inject(AuthenticationService);

  // Inyectar servicio de notificaciones
  private noti = inject(NotificationService);

  // Inyectar servicio de traducción
  private translate = inject(TranslateService);

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

    console.log("¿Usuario autenticado?", this.isAuthenticated());
    console.log("Usuario actual:", this.currentUser());


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

    // Lógica para usuario con rol ADMIN (puede saltarse todo el flujo)
    if (usuario.rol === 'ADMIN') {
      // ADMIN siempre puede actualizar (ASIGNAR o CERRAR)
      return true;
    }

    // Lógica para usuario con rol TECNICO 
    if (usuario.rol === 'TECNICO') {
      // Técnico puede cambiar si hay siguientes estados disponibles
      const siguientesEstados = this.FLUJO_ESTADOS[ticket.estado as EstadoTicket] || [];
      return siguientesEstados.length > 0; // devolver true si siguientesEstados es mayor a 0
    }

    // Lógica para usuario con rol CLIENTE
    if (usuario.rol === 'CLIENTE') {
      // El cliente solo puede CERRAR su propio ticket si está RESUELTO
      return ticket.estado === EstadoTicket.RESUELTO && 
             ticket.solicitante.id === usuario.id;
    }

    // Devolver false por defecto
    return false;
  });

  /**
   * Método para verificar si el usuario tiene permiso para cambiar a un estado específico
   */
  // private tienePermisoParaEstado(estadoNuevo: EstadoTicket, ticket: TicketModel, usuario: any): boolean {

  //   // Obtener el id de usuario y el rol a partir del usuario 
  //   const { id: usuarioId, rol } = usuario;

  //   // SOLO LOS TÉCNICOS PUEDEN CAMBIAR EL TIQUETE A EN_PROCESO O RESUELTO
  //   // A partir del record FLUJO_ESTADOS se revisa si EstadoTicket 
  //   // es "EN_PROCESO" o "RESUELTO"
  //   if ([EstadoTicket.EN_PROCESO, EstadoTicket.RESUELTO].includes(estadoNuevo)) {

  //     // retornar true si el rol es TECNICO
  //     return rol === 'TECNICO';
  //   }

  //   // SOLO EL CLIENTE QUE CREÓ EL TIQUETE O EL ADMIN PUEDEN CERRARLO
  //   if (estadoNuevo === EstadoTicket.CERRADO) {

  //     //retornar true si el id de usuario es el del solicitanteId del tiquete 
  //     // o si el rol es ADMIN 
  //     return ticket.solicitanteId === usuarioId || rol === 'ADMIN'
  //   }

  //   // ADMIN PUEDE CAMBIAR EL ESTADO DEL TIQUETE A ASIGNADO
  //   if (estadoNuevo === EstadoTicket.ASIGNADO) {

  //     // retornar true si el rol del usuario es ADMIN 
  //     return rol === 'ADMIN';
  //   }

  //   // devoler false por defecto
  //   return false;

  // }

  /**
   * Método para abrir el diálogo de cambio de estado del ticket
   */
  abrirDialogoCambioEstado(): void {

    // Obtener el tiquete
    const ticket = this.datos();

    // Obtener el usuario autenticado
    const usuario = this.currentUser();

    // Si no hay tiquete o usuario, salir del 
    // método
    if (!ticket || !usuario) return;

    // Declarar un arreglo de estadosPermitidos de tipo EstadoTicket
    let estadosPermitidos: EstadoTicket[] = [];

    // Lógica para usuario con rol ADMIN
    if (usuario.rol === 'ADMIN'){

      // Si el estado del tiquete es PENDIENTE, puede asignarlo
      if (ticket.estado === EstadoTicket.PENDIENTE) {
        estadosPermitidos.push(EstadoTicket.ASIGNADO); // Agregar el estado ASIGNADO al array de estadosPermitidos
      }

      // Si el estado del tiquete es cualquier otro (EN_PROCESO, RESUELTO), puede cerrarlo directamente
      if (ticket.estado !== EstadoTicket.CERRADO) {
        estadosPermitidos.push(EstadoTicket.CERRADO); // Agregar el estado CERRADO al array de estadosPermitidos
      }

      console.log('[ADMIN] Estados disponibles:', estadosPermitidos); // Imprimir los estadosPermitidos para Admin
    }

    // Lógica para usuario con rol TECNICO
    else if (usuario.rol === 'TECNICO') {

      // Utilizar una variable tipo Record/Mapa para mapear los estados disponibles para el usuario Técnico

      const FLUJO_TECNICO: Record<EstadoTicket, EstadoTicket[]> = {
        [EstadoTicket.PENDIENTE]: [],
        [EstadoTicket.ASIGNADO]: [EstadoTicket.EN_PROCESO],
        [EstadoTicket.EN_PROCESO]: [EstadoTicket.RESUELTO],
        [EstadoTicket.RESUELTO]: [],
        [EstadoTicket.CERRADO]: []
      };

      // Asignar al arreglo estadosPermitidos el Record de FLUJO_TECNICO
      estadosPermitidos = FLUJO_TECNICO[ticket.estado as EstadoTicket] || [];
      console.log('[TÉCNICO] Estados disponibles:', estadosPermitidos);
    }

    // Lógica para usuario con rol CLIENTE
    else if (usuario.rol === 'CLIENTE') {
      // Cliente solo puede CERRAR su propio ticket si está RESUELTO
      if (ticket.estado === EstadoTicket.RESUELTO && ticket.solicitante.id === usuario.id) {
        estadosPermitidos.push(EstadoTicket.CERRADO);
      }
      console.log('[CLIENTE] Estados disponibles:', estadosPermitidos);
    }

    // Validar que haya estados disponibles 
    if (estadosPermitidos.length === 0) {
      const titleKey = 'TICKET_DETAIL.SIN_PERMISOS_TITULO';
      const messageKey = 'TICKET_DETAIL.SIN_PERMISOS_MENSAJE';
      this.translate.get([titleKey, messageKey]).subscribe(translations => {
        this.noti.warning(
          translations[titleKey],
          translations[messageKey]
        );
      });
      return;
    }

    // // Obtener los siguientes estados disponibles 
    // const siguientesEstadosTicket = this.FLUJO_ESTADOS[ticket.estado as EstadoTicket] || [];

    // // Filtrar los estados a los que el usuario tiene permiso para cambiar
    // const estadosDisponibles = siguientesEstadosTicket.filter(estado =>
    //   this.tienePermisoParaEstado(estado, ticket, usuario) // invocar el método de permiso
    // );

    // // Si no hay estados disponibles, salir del método
    // if (estadosDisponibles.length === 0) return;

    // Constante para abrir el diálogo de cambio de estado del ticket
    const dialogRef = this.ticketDialog.open(TicketHistorialViewDialog, {
      width: '700px', // Ancho fijo
      maxWidth: '95vw', // Ancho máximo para pantallas pequeñas
      disableClose: false, // Permitir cerrar el diálogo haciendo clic fuera de él

      // Pasar datos al diálogo (ticket, estadosDisponibles, usuarioLogueado)
      data: {
        ticket: ticket,
        estadosDisponibles: estadosPermitidos,
        usuarioLogueado: usuario
      }
    });

    // Suscribirse al cierre del diálogo para recargar el ticket si se actualizó el estado
    dialogRef.afterClosed().subscribe(result => {
      // Si el resultado es verdadero, significa que se actualizó el estado
      if (result === true) {
        console.log("[DIALOG DETALLE TIQUETE] - Estado actualizado, recargando ticket ...");
        this.obtenerTicket(ticket.id); // Recargar el tiquete
      }
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


    // Obtener el idioma actual desde el servicio de traducción
    const idiomaActual = this.translate.currentLang || 'es';

    // Obtener día, mes y año
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

    // Formatear según el idioma
    if (idiomaActual === 'en') {
      // Formato inglés: MM/DD/YYYY hh:mm AM/PM
      return `${mes}/${dia}/${anio} ${horasFormateadas}:${minutos} ${ampm}`;
    }

    // Formato español (por defecto): DD/MM/AAAA hh:mm AM/PM
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
      return `${diffDias} d`;
    }

    // Si no tiene dias (dias = 0), pero sí más de 0 horas, mostrar formato: 0 d (X hrs Y mins)
    if (diffDias === 0 && diffHoras > 0) {
      return `0 d (${diffHoras} hrs ${diffMinutos} min)`;
    }

    // Si no tiene dias (dias = 0) y tampoco horas (hr = 0) mostrar 0 d (0 hrs Y mins)
    if (diffDias === 0 && diffHoras === 0) {
      return `0 d (0 hrs ${diffMinutos} min)`;
    }

    return 0; 

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
    this.ticketDialog.open(TicketImageViewDialog, {
      data: { src },
      panelClass: 'img-dialog-panel'
    });
  }

}
