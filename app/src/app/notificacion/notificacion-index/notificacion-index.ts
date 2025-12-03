import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { NotificacionesService } from '../../share/services/app/notificaciones.service';
import { NotificacionModel } from '../../share/models/NotificacionModel';
import { EstadoNotificacion} from '../../share/models/EnumsModel';

// Tipo para el tipo de filtrado de estado de notificación
type FiltroEstado = 'TODAS' | 'LEIDA' | 'NO_LEIDA';

@Component({
  selector: 'app-notificacion-index',
  standalone: false,
  templateUrl: './notificacion-index.html',
  styleUrl: './notificacion-index.css'
})

export class NotificacionIndex implements OnInit {

    // Inyección de servicios
    private router = inject (Router);
    private authService = inject (AuthenticationService);
    notificacionesService = inject (NotificacionesService);

    readonly EstadoNotificacion = EstadoNotificacion; 

    // Signal de autenticación 
    readonly currentUser = this.authService.usuario; 

    // Signal para el estado de carga 
    cargando = signal <boolean>(false);

    // Signal para filtrar el estado de las notificaciones (todas, leídas, no leídas)
    filtroEstado = signal<FiltroEstado>('TODAS');

    // Signal para las notificaciones expandidas en el acordeón (por ID)
    notificacionesExpandidas = signal<Set<number>>(new Set());

    // Signal computada para filtrar las notificaciones
    notificacionesFiltradas = computed (() => {
        const todas = this.notificacionesService.todasNotificaciones();
        const filtro = this.filtroEstado();

        // Si el filtro son todas, devolver todas 
        if (filtro === 'TODAS') {
            return todas; 
        }

        return todas.filter(n => n.estado === filtro);
    })

    // Signals computadas para los contadores de notificaciones
    totalNotificaciones = computed(() => this.notificacionesService.todasNotificaciones().length);
    totalNoLeidas = computed(() => 
        this.notificacionesService.todasNotificaciones().filter(n => n.estado === EstadoNotificacion.NO_LEIDA).length
    );

    // OnInit del componente 
    ngOnInit(): void {
        this.cargarNotificaciones(); 
    }

    /**
     * Cargar las notificaciones del usuario 
     */
    cargarNotificaciones(): void {
        const usuarioId = this.currentUser()?.id; 

        // Revisar que haya un usuario cargado 
        if (!usuarioId){
            console.error("No hay usuario logueado");
            return; 
        }

        // Marcar la signal de carga como true 
        this.cargando.set(true);
        
        console.log('Cargando TODAS las notificaciones para usuario:', usuarioId);
        this.notificacionesService.cargarTodasNotificaciones(usuarioId);
        
        // Desactivar loading después de un delay porque sino se queda cargando
        setTimeout(() => {
          this.cargando.set(false);
          console.log('Carga completada');
        }, 1000);
    }

  /**
   * Expandir o colapsar una notificación
   */
  toggleExpansion(notificacionId: number): void {
    this.notificacionesExpandidas.update(set => {
      const newSet = new Set(set);
      if (newSet.has(notificacionId)) {
        newSet.delete(notificacionId);
      } else {
        newSet.add(notificacionId);
      }
      return newSet;
    });
  }

  /**
   * Verificar si una notificación está expandida
   */
  isExpanded(notificacionId: number): boolean {
    return this.notificacionesExpandidas().has(notificacionId);
  }

  /**
   * Marcar una notificación como leída
   */
  marcarComoLeida(notificacion: NotificacionModel, event: Event): void {

  console.log('[COMPONENTE] ========== INICIO ==========');
  console.log('[COMPONENTE] Notificación:', notificacion);
  console.log('[COMPONENTE] Estado actual:', notificacion.estado);
  console.log('[COMPONENTE] EstadoNotificacion.LEIDA:', EstadoNotificacion.LEIDA);
  console.log('[COMPONENTE] ¿Son iguales?', notificacion.estado === EstadoNotificacion.LEIDA);
  

    event.stopPropagation(); // Evitar que se expanda el acordeón

    if (notificacion.estado === EstadoNotificacion.LEIDA) {//Que sea el enum
      return; // Ya está leída
    }

    // Llamar al servicio para actualizar en el backend
    this.notificacionesService.marcarComoLeida(notificacion.id);

    // Trigger para recargar as notificaciones en el header
    setTimeout(() => {
      this.notificacionesService.triggerRecarga();
      console.log('[FRONTEND] Trigger de recarga de notificaciones enviado');
    }, 1000); // Esperar 1 segundo
  }

  /**
   * Ir al ticket relacionado
   */
  irAlTicket(ticketId: number | null, event: Event): void {
    event.stopPropagation();
    if (ticketId) {
      this.router.navigate(['/ticket', ticketId]);
    }
  }

  /**
   * Cambiar filtro de estado
   */
  cambiarFiltro(filtro: FiltroEstado): void {
    this.filtroEstado.set(filtro);
  }

  /**
   * Obtener icono según el tipo de notificación
   */
  getIcono(tipo: string): string {
    const iconos: Record<string, string> = {
      'TICKET_CREADO': 'confirmation_number',
      'TICKET_ASIGNADO': 'assignment_ind',
      'ESTADO_CAMBIADO': 'sync',
      'COMENTARIO': 'comment',
      'VENCIMIENTO_PROXIMO': 'schedule',
      'SLA_INCUMPLIDO': 'warning',
      'DEFAULT': 'notifications'
    };
    return iconos[tipo] || iconos['DEFAULT'];
  }

  /**
   * Obtener color según el tipo de notificación
   */
  getColorClase(tipo: string): string {
    const colores: Record<string, string> = {
      'TICKET_CREADO': 'tipo-creado',
      'TICKET_ASIGNADO': 'tipo-asignado',
      'ESTADO_CAMBIADO': 'tipo-estado',
      'COMENTARIO': 'tipo-comentario',
      'VENCIMIENTO_PROXIMO': 'tipo-vencimiento',
      'SLA_INCUMPLIDO': 'tipo-sla',
      'DEFAULT': 'tipo-default'
    };
    return colores[tipo] || colores['DEFAULT'];
  }

  /**
   * Formatear fecha relativa
   */
  formatearFecha(fecha: Date | string): string {
    const ahora = new Date();
    const fechaNotificacion = new Date(fecha);
    const diffMs = ahora.getTime() - fechaNotificacion.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} hr${diffHoras > 1 ? 's' : ''}`;
    if (diffDias < 7) return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
    
    return fechaNotificacion.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }


}