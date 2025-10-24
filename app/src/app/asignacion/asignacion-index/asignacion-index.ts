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

  // ✅ AGREGAR: Verificar que sea un array
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

  // Objeto para organizar los tickets por estado
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
      const ticketKanban = this.convertirATicketKanban(ticket);
      const diaSemana = this.obtenerDiaSemana(ticket.creadoAt);
      if (organizados[diaSemana]) {
        organizados[diaSemana].push(ticketKanban);
      }
    } catch (error) {
      console.error('Error al procesar ticket:', ticket, error);
    }
  });

  console.log('Tickets organizados por día:', organizados);
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

    /**
   *Configurar las fechas de la semana actual
   */
  configurarFechasSemana(): void {
    const hoy = new Date();
    const inicioSemana = this.obtenerInicioSemana(hoy);
    
    this.columnas.forEach((columna, index) => {
      const fecha = new Date(inicioSemana);
      fecha.setDate(inicioSemana.getDate() + index);
      columna.fecha = fecha.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    });
  }

    /**
   * Obtener el lunes de la semana actual
   */
  obtenerInicioSemana(fecha: Date): Date {
    const dia = fecha.getDay();
    const diff = fecha.getDate() - dia + (dia === 0 ? -6 : 1); // Lunes como inicio
    return new Date(fecha.setDate(diff));
  }

  /**
   * Obtener el día de la semana en español
   */
  obtenerDiaSemana(fecha: string | Date): string {
    const date = new Date(fecha);
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return dias[date.getDay()];
  }

  /**
   * Cargar los tickets desde el servicio
   */
  cargarTickets(): void {
  // Asignar true a la signal de cargando
  this.cargando.set(true);

  // Asignar null a la signal de error
  this.error.set(null);

  // Obtener todos los tickets desde el servicio de tickets desde el API 
  this.ticketService.getTicketsKanban().subscribe({
    next: (response) => {
      console.log('[FRONTEND] Respuesta completa del API:', response);
      
      // ✅ CORREGIR: Manejar la estructura de respuesta correcta
      let ticketsArray: TicketModel[] = [];
      
      if (Array.isArray(response)) {
        // Si la respuesta es directamente un array
        ticketsArray = response;
        console.log('[FRONTEND] Respuesta es array directo');
      } else if (response && response.tickets && Array.isArray(response.tickets)) {
        // Si la respuesta tiene estructura { tickets: [...] }
        ticketsArray = response.tickets;
        console.log('[FRONTEND] Respuesta tiene estructura con tickets:', response.tickets.length);
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

    // Obtener el tiempo restante (fecha) del ticket (fechaLimite - hoy)

    const tiempoRestante = fechaLimite.getTime() - hoy.getTime();

    // Convertir el tiempo restante en horas
    const tiempoRestanteHoras = Math.floor(tiempoRestante / (1000 * 60 * 60));

    // Convertir el tiempo restante en días
    const tiempoRestanteDias = Math.floor(tiempoRestanteHoras / 24);

    /**
     * Calcular el tiempo restante del SLA
     */

    // Variable de tiempoRestanteSAL 

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

      // Case contrario (tiempoRestante >= 0 y horas restantes <= 0) 
      // asignar los minutos restantes
    } else {
      const minutosRestantes = Math.floor(tiempoRestante / (1000 * 60));
      tiempoRestanteSLA = `${minutosRestantes}m`;
    }

    // Calcular porcentaje de tiempo restante (para barra de progreso)
    const tiempoTotal = 7 * 24 * 60 * 60 * 1000; // Asumiendo 7 días de SLA
    const porcentajeSLA = Math.max(0, Math.min(100, (tiempoRestante / tiempoTotal) * 100));

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
  
    // Obtener nombre de categoría de forma segura
    const nombreCategoria = (ticket as any).categoria?.nombre || `Categoría ${ticket.categoriaId}`;

    // Obtener el día de la semana del ticket
    const diaSemana = this.obtenerDiaSemana(ticket.creadoAt);

    return {
      id: ticket.id,
      codigo: ticket.codigo,
      titulo: ticket.titulo,
      categoria: nombreCategoria, // ✅ CORREGIR: Usar la variable segura
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
