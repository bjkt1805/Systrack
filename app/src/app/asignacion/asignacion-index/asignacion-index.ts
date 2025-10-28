import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TicketService } from '../../share/services/api/ticket.service';
import { TicketModel } from '../../share/models/TicketModel';

// Interfaz para armar el tablero de asignaciones (tipo Kanban)

interface TicketKanban {
  id: number;
  codigo: string;
  titulo: string;
  categoria: string;
  estado: string;
  prioridad: string;
  fechaLimiteResolucion: Date;
  tiempoRestanteSLA: string;
  porcentajeSLA: number;
  colorUrgencia: string;
  iconoCategoria: string;
  diaSemana: string;
  cumplioRespuesta: boolean | null;
  cumplioResolucion: boolean | null;
}

@Component({
  selector: 'app-asignacion-index',
  standalone: false,
  templateUrl: './asignacion-index.html',
  styleUrl: './asignacion-index.css'
})

// Clase para el componente de vista de asignaciones que implementa OnInit
export class AsignacionIndex implements OnInit {

  // Inyectar el servicio de TicketService
  private ticketService = inject(TicketService);

  // Inyectar Router
  private router = inject(Router);

  // Signal para obtener los tickets
  tickets = signal<TicketModel[]>([]);

  // Signal para cargar los tickets
  cargando = signal<boolean>(false);

  // Signal para manejar error a la hora de cargar tickets
  error = signal<string | null>(null);

  // Columnas por días de la semana
  columnas = [
    { dia: 'lunes', titulo: 'Lunes', color: '#2196f3', fecha: '' }, // azul
    { dia: 'martes', titulo: 'Martes', color: '#4caf50', fecha: '' }, // verde
    { dia: 'miercoles', titulo: 'Miércoles', color: '#ff9800', fecha: '' }, // naranja
    { dia: 'jueves', titulo: 'Jueves', color: '#9c27b0', fecha: '' }, // morado
    { dia: 'viernes', titulo: 'Viernes', color: '#f44336', fecha: '' }, // rojo
    { dia: 'sabado', titulo: 'Sábado', color: '#795548', fecha: '' }, // marrón
    { dia: 'domingo', titulo: 'Domingo', color: '#607d8b', fecha: '' } // gris
  ];

  // Computed signal para organizar los tickets por día de la semana
  ticketsPorDia = computed(() => {

    // Asignar a la variable todosLosTickets el valor de la signal tickets
    const todosLosTickets = this.tickets();

    // Verificar que todosLosTickets es un array
    if (!Array.isArray(todosLosTickets)) {
      console.warn('todosLosTickets no es un array:', todosLosTickets);
      return {
        'lunes': [],
        'martes': [],
        'miercoles': [],
        'jueves': [],
        'viernes': [],
        'sabado': [],
        'domingo': []
      };
    }

    // Objeto para organizar los tickets por dia de la semana
    const organizados: { [key: string]: TicketKanban[] } = {
      'lunes': [],
      'martes': [],
      'miercoles': [],
      'jueves': [],
      'viernes': [],
      'sabado': [],
      'domingo': []
    };

    // Recorrer todos los tickets y asignarlos al arreglo correspondiente en el objeto organizados
    todosLosTickets.forEach(ticket => {
      try {

        // Para cada ticket en el array, convertirlo a TicketKanban por medio de convertirATicketKanban
        const ticketKanban = this.convertirATicketKanban(ticket);

        // Obtener el día de la semana del ticket a partir de su fecha de creación (obtenerDiaSemana extrae el dia)
        const diaSemana = this.obtenerDiaSemana(ticket.creadoAt);

        // Si el día de la semana es válido (ej: 'lunes'), agregar el ticket al arreglo correspondiente
        // con el método push
        if (organizados[diaSemana]) {
          organizados[diaSemana].push(ticketKanban);
        }

      // Si hay error al procesar el ticket, mostrar en consola
      } catch (error) {
        console.error('[FRONTEND] Error al procesar ticket:', ticket, error);
      }
    });

    // Mostrar el resultado de la organización en consola
    console.log('[FRONTEND] Tickets organizados por día:', organizados);

    // Retornar el objeto con los tickets organizados por día
    return organizados;
  });

  // Método OnInit para cargar los tickets correspondientes
  ngOnInit(): void {
    // Lógica de inicialización del componente

    // Configurar las fechas de la semana en las columnas
    this.configurarFechasSemana();

    // Cargar los tickets desde el servicio
    this.cargarTickets();
  }

  // AGREGAR: Método para cambiar la semana
  cambiarSemana(fecha: string): void {
    this.fechaSemanaObjetivo = fecha;
    this.configurarFechasSemanaPersonalizada(fecha);
    this.cargarTickets();
  }

  /**
 *Configurar las fechas de la semana actual
 */
  configurarFechasSemana(): void {
    this.configurarFechasSemanaPersonalizada(this.fechaSemanaObjetivo);
  }

  /**
 * Configurar fechas para una semana específica
 */
configurarFechasSemanaPersonalizada(fechaBase: string): void {
  // Convertir la fechaBase a un objeto Date
  const fecha = new Date(fechaBase);

  // Obtener el inicio de la semana (lunes)
  const inicioSemana = this.obtenerInicioSemana(fecha);

  // Para cada columna, usar UTC
  this.columnas.forEach((columna, index) => {

    // USAR métodos UTC para crear la fecha de la columna (Ejemplo: Lunes 27-10)
    const año = inicioSemana.getUTCFullYear();
    const mes = inicioSemana.getUTCMonth();
    const dia = inicioSemana.getUTCDate();
    
    // CREAR fecha en formato UTC para cada día de la semana
    const fechaColumna = new Date(Date.UTC(año, mes, dia + index, 0, 0, 0, 0));
    
    // FORMATEAR usando métodos UTC
    const diaFormateado = fechaColumna.getUTCDate().toString().padStart(2, '0');
    const mesFormateado = (fechaColumna.getUTCMonth() + 1).toString().padStart(2, '0');
    
    columna.fecha = `${diaFormateado}/${mesFormateado}`;
    
    // AGREGAR log para verificar
    console.log(`[FRONTEND] Columna ${columna.dia}: ${columna.fecha} (UTC: ${fechaColumna.toISOString()})`);
  });

  console.log('[FRONTEND] Fechas de columnas configuradas para la semana del:', fechaBase);
}

  /**
 * Obtener el lunes de la semana actual
 */
  obtenerInicioSemana(fecha: Date): Date {

    // TRABAJAR en UTC para evitar conversiones de zona horaria
    const año = fecha.getUTCFullYear();
    const mes = fecha.getUTCMonth();
    const dia = fecha.getUTCDate();

    // CREAR fecha UTC explícita
    const fechaUTC = new Date(Date.UTC(año, mes, dia, 0, 0, 0, 0));

    console.log('[FRONTEND] === DEBUG INICIO SEMANA ===');
    console.log('[FRONTEND] Fecha original:', fecha.toISOString());
    console.log('[FRONTEND] Fecha UTC creada:', fechaUTC.toISOString());
    console.log('[FRONTEND] getUTCDay():', fechaUTC.getUTCDay());
    console.log('[FRONTEND] getUTCDate():', fechaUTC.getUTCDate());

    const diaSemana = fechaUTC.getUTCDay(); // 0 = domingo, 1 = lunes, etc.

    // CÁLCULO para obtener el lunes (semana empieza en lunes)
    let diasARestar = 0;

    // Si es domingo, ir al lunes anterior (restar 6 días)
    if (diaSemana === 0) {

      diasARestar = 6;

    // Para cualquier otro día, restar (día - 1) para llegar al lunes
    } else {

      diasARestar = diaSemana - 1;
    }

    console.log('[FRONTEND] Días a restar para llegar al lunes:', diasARestar);

    // CREAR el lunes de esa semana en UTC
    const lunes = new Date(Date.UTC(año, mes, dia - diasARestar, 0, 0, 0, 0));

    console.log('[FRONTEND] Lunes calculado:', lunes.toISOString());
    console.log('[FRONTEND] Verificación - día de la semana del lunes:', lunes.getUTCDay()); // Debe ser 1
    console.log('[FRONTEND] === FIN DEBUG  ===');

    return lunes;
  }

  /**
   * Obtener el día de la semana en español
   */
  obtenerDiaSemana(fecha: string | Date): string {
    const date = new Date(fecha);
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return dias[date.getDay()];
  }

  // Propiedad para la fecha de la semana objetivo (del 27 de octubre al 1 de noviembre)
  // tomando el 27 de octubre como la fecha inicial a enviar de Parámetro
  // esta luego se cambiará con un signal o una constantes que recibirá la fecha 
  // desde un dateTimePicker en el html. 
  private fechaSemanaObjetivo: string = '2025-10-27';

  /**
   * Cargar los tickets desde el servicio
   */
  cargarTickets(): void {
    // Asignar true a la signal de cargando
    this.cargando.set(true);

    // Asignar null a la signal de error
    this.error.set(null);

    console.log(`[FRONTEND] Solicitando tickets para la semana del: ${this.fechaSemanaObjetivo}`);

    // Obtener todos los tickets desde el servicio de tickets desde el API 
    this.ticketService.getTicketsKanban(this.fechaSemanaObjetivo).subscribe({
      next: (response) => {
        console.log('[FRONTEND] Respuesta completa del API:', response);

        // Manejar la estructura de respuesta correcta
        let ticketsArray: TicketModel[] = [];

        if (Array.isArray(response)) {
          // Si la respuesta es directamente un array
          ticketsArray = response;
          console.log('[FRONTEND] La respuesta es un arreglo');

        } else if (response && response.tickets && Array.isArray(response.tickets)) {

          // Si la respuesta tiene estructura { tickets: [...] }
          ticketsArray = response.tickets;
          console.log('[FRONTEND] La respuesta tiene estructura con tickets:', response.tickets.length);

          // Log de información de la semana
          if (response.semana) {
            console.log(`[FRONTEND] Semana obtenida del API: ${response.semana.inicio} a ${response.semana.fin}`, {
              inicio: response.semana.inicio,
              fin: response.semana.fin,
              total: response.total
            });
          }


        } else {
          console.error('[FRONTEND] Estructura de respuesta inesperada:', response);
          this.error.set('Error: Formato de respuesta inválido');
          this.cargando.set(false);
          return;
        }

        console.log('[FRONTEND] Array de tickets final:', ticketsArray);
        // Asignar los tickets obtenidos a la signal tickets
        this.tickets.set(ticketsArray);
        // Asignar false a la signal de cargando
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('[FRONTEND] Error al cargar tickets desde el API:', error);
        // Asignar el mensaje de error a la signal de error
        this.error.set('[FRONTEND] Error al cargar los tickets');
        // Asignar false a la signal de cargando
        this.cargando.set(false);
      }
    });
  }

  /**
   * Convertir un TicketModel a TicketKanban
   * @param ticket TicketModel a convertir
   * @returns TicketKanban convertido
   */

convertirATicketKanban(ticket: TicketModel): TicketKanban {

  // Determinar qué fecha usar como referencia para los cálculos
  let fechaReferencia: Date;

  // Inicializar variable con el valor del backend que ya tenga el cumplimiento de resolución
  let cumplimientoReal = ticket.cumplioResolucion;

  // Si el ticket está resuelto, usar la fecha de resolución
  if (ticket.estado === 'RESUELTO' && ticket.resueltoAt) {
    fechaReferencia = new Date(ticket.resueltoAt);
  } 
  // Si el ticket está cerrado, usar la fecha de cierre
  else if (ticket.estado === 'CERRADO' && ticket.cerradoAt) {
    fechaReferencia = new Date(ticket.cerradoAt);
  } 
  // Si el ticket está activo, usar la fecha actual
  else {
    fechaReferencia = new Date();
  }

  // Convertir la fecha límite de resolución a objeto Date
  const fechaLimite = new Date(ticket.fechaLimiteResolucion);
  
  // Convertir la fecha de creación a objeto Date
  const fechaCreacion = new Date(ticket.creadoAt);
  
  // Calcular el tiempo total del SLA
  const tiempoTotalSLA = fechaLimite.getTime() - fechaCreacion.getTime();
  
  // Calcular el tiempo restante hasta la fecha límite
  const tiempoRestante = fechaLimite.getTime() - fechaReferencia.getTime();
  
  // Convertir el tiempo restante a horas
  const tiempoRestanteHoras = Math.floor(tiempoRestante / (1000 * 60 * 60));
  
  // Convertir el tiempo restante a días
  const tiempoRestanteDias = Math.floor(tiempoRestanteHoras / 24);
  
  // Si el ticket está finalizado, validar el cumplimiento contra las fechas reales
  if (ticket.estado === 'RESUELTO' || ticket.estado === 'CERRADO') {
    // Si tiempoRestante >= 0, se cumplió; si < 0, se venció
    cumplimientoReal = tiempoRestante >= 0;
  }

  // Variable para almacenar el texto del SLA a mostrar
  let tiempoRestanteSLA: string = '';

  // Si el ticket está finalizado (resuelto o cerrado)
  if (ticket.estado === 'RESUELTO' || ticket.estado === 'CERRADO') {

    // Mostrar "Cumplido" o "Vencido" según el cumplimiento validado
    tiempoRestanteSLA = cumplimientoReal ? 'Cumplido' : 'Vencido';
  } 

  //  SI EL TICKET ESTÁ ACTIVO (PENDIENTE, ASIGNADO, EN PROCESO)
  else {
    // Si el tiempo restante es negativo, el SLA ya se venció
    if (tiempoRestante < 0) {
      tiempoRestanteSLA = 'Vencido';
    } 
    // Si quedan más de 24 horas, mostrar días y horas
    else if (tiempoRestanteDias > 0) {
      tiempoRestanteSLA = `${tiempoRestanteDias}d ${tiempoRestanteHoras % 24}h`;
    } 
    // Si quedan menos de 24 horas pero más de 1, mostrar solo horas
    else if (tiempoRestanteHoras > 0) {
      tiempoRestanteSLA = `${tiempoRestanteHoras}h`;
    } 
    // Si queda menos de 1 hora, mostrar minutos
    else {
      const minutosRestantes = Math.floor(tiempoRestante / (1000 * 60));
      tiempoRestanteSLA = `${minutosRestantes}m`;
    }
  }

  // Calcular el tiempo transcurrido desde la creación
  const tiempoTranscurrido = fechaReferencia.getTime() - fechaCreacion.getTime();
  
  // Variable para el porcentaje de tiempo consumido del SLA
  let porcentajeSLA = 0;
  
  // Si el tiempo total es válido (mayor a 0)
  if (tiempoTotalSLA > 0) {
    // Calcular porcentaje consumido (0 a 100), limitado entre 0 y 100
    porcentajeSLA = Math.min(100, Math.max(0, (tiempoTranscurrido / tiempoTotalSLA) * 100));
  }

  // Variable para determinar el color de urgencia del ticket
  let colorUrgencia = '';
  
  // Si el ticket está finalizado (resuelto o cerrado)
  if (ticket.estado === 'RESUELTO' || ticket.estado === 'CERRADO') {
    // Color verde si cumplió, rojo si se venció
    colorUrgencia = cumplimientoReal ? 'cumplido' : 'vencido';
  } 
  // Si el ticket está activo
  else {

    // Si ya se venció el SLA, color rojo
    if (tiempoRestante < 0) {
      colorUrgencia = 'vencido';
    } 
    // // Si es urgente o quedan menos de 4 horas, color rojo urgente
    // else if (ticket.prioridad === 'URGENTE' || tiempoRestanteHoras < 4) {
    //   colorUrgencia = 'urgente';
    // } 
    // // Si es alta prioridad o quedan menos de 24 horas, color naranja
    // else if (ticket.prioridad === 'ALTA' || tiempoRestanteHoras < 24) {
    //   colorUrgencia = 'alta';
    // } 
    // // Si es prioridad media, color amarillo
    // else if (ticket.prioridad === 'MEDIA') {
    //   colorUrgencia = 'media';
    // } 
    // Si el SLA está cumplido (o pendiente), color verde
    else {
      colorUrgencia = 'cumplido';
    }
  }

  // Obtener el ícono correspondiente a la categoría del ticket
  const iconoCategoria = this.obtenerIconoCategoria(ticket.categoriaId);
  
  // Obtener el día de la semana en que se creó el ticket
  const diaSemana = this.obtenerDiaSemana(ticket.creadoAt);

  // Retornar el objeto TicketKanban con toda la información procesada
  return {
    id: ticket.id,
    codigo: ticket.codigo,
    titulo: ticket.titulo,
    categoria: ticket.categoria.nombre,
    estado: ticket.estado,
    prioridad: ticket.prioridad,
    fechaLimiteResolucion: fechaLimite,
    tiempoRestanteSLA,
    porcentajeSLA,
    colorUrgencia,
    iconoCategoria,
    diaSemana,
    cumplioRespuesta: ticket.cumplioRespuesta ?? null,
    cumplioResolucion: ticket.cumplioResolucion ?? null, // Aqui usar el valor validado por el frontend
  };
}

  /**
 * Obtener el ícono Material según el ID de categoría
 * @param categoriaId ID de la categoría
 * @returns Nombre del ícono Material
 */
  obtenerIconoCategoria(categoriaId: number): string {
    const iconos: { [key: number]: string } = {
      1: 'computer',        // Hardware
      2: 'router',          // Redes
      3: 'lock',            // Seguridad
      4: 'inventory',       // Software
      5: 'support_agent'    // Soporte
    };
    return iconos[categoriaId] || 'confirmation_number';
  }

  /**
   * Navega al detalle del ticket
   */
  verDetalle(ticketId: number): void {
    this.router.navigate(['/ticket', ticketId]);
  }

  /**
   * Obtiene el total de tickets por dia
   */
  getTotalPorDia(dia: string): number {
    return this.ticketsPorDia()[dia]?.length || 0;
  }

  /**
   * Método para recargar tickets (útil para botón de refresh)
   */
  recargarTickets(): void {
    this.cargarTickets();
  }

}
