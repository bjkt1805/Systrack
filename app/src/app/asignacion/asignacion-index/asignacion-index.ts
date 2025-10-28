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

  // Obtener la fecha de hoy
  const hoy = new Date();

  // Obtener la fecha límite de resolución del ticket
  const fechaLimite = new Date(ticket.fechaLimiteResolucion);

  // CALCULAR el tiempo total del SLA (desde creación hasta fecha límite)
  const fechaCreacion = new Date(ticket.creadoAt);
  const tiempoTotalSLA = fechaLimite.getTime() - fechaCreacion.getTime();

  // Obtener el tiempo restante (fecha) del ticket (fechaLimite - hoy)
  const tiempoRestante = fechaLimite.getTime() - hoy.getTime();

  // Convertir el tiempo restante en horas
  const tiempoRestanteHoras = Math.floor(tiempoRestante / (1000 * 60 * 60));

  // Convertir el tiempo restante en días
  const tiempoRestanteDias = Math.floor(tiempoRestanteHoras / 24);

  /**
   * Calcular el tiempo restante del SLA
   */
  let tiempoRestanteSLA: string = '';

  // Si el tiempo Restante es menor a 0, el SLA está vencido
  if (tiempoRestante < 0) {
    tiempoRestanteSLA = 'Vencido';

  // Si los dias restantes son mayores a 0 
  } else if (tiempoRestanteDias > 0) {
    // A tiempoRestanteSLA se le asigna el valor de los días y horas restantes
    tiempoRestanteSLA = `${tiempoRestanteDias}d ${tiempoRestanteHoras % 24}h`;

  // Si las horas restantes son mayores a 0
  } else if (tiempoRestanteHoras > 0) {
    // A tiempoRestanteSLA se le asigna el valor de las horas restantes
    tiempoRestanteSLA = `${tiempoRestanteHoras}h`;

  // Caso contrario (tiempoRestante >= 0 y horas restantes <= 0) 
  } else {
    const minutosRestantes = Math.floor(tiempoRestante / (1000 * 60));
    tiempoRestanteSLA = `${minutosRestantes}m`;
  }

  // CALCULAR porcentaje basado en el tiempo REAL del ticket
  // Si está vencido, porcentaje = 0. Si no, calcular proporción restante
  let porcentajeSLA = 0;
  if (tiempoRestante > 0 && tiempoTotalSLA > 0) {
    porcentajeSLA = Math.min(100, (tiempoRestante / tiempoTotalSLA) * 100);
  }

  // Determinar color de urgencia
  let colorUrgencia = '';
  if (ticket.prioridad === 'URGENTE' || tiempoRestanteHoras < 4 || tiempoRestante < 0) {
    colorUrgencia = 'urgente';
  } else if (ticket.prioridad === 'ALTA' || tiempoRestanteHoras < 24) {
    colorUrgencia = 'alta';
  } else if (ticket.prioridad === 'MEDIA') {
    colorUrgencia = 'media';
  } else {
    colorUrgencia = 'baja';
  }

  // Determinar icono según categoría
  const iconoCategoria = this.obtenerIconoCategoria(ticket.categoriaId);

  // Obtener el día de la semana del ticket
  const diaSemana = this.obtenerDiaSemana(ticket.creadoAt);

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
