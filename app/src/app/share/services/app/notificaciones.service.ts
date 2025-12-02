import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificacionModel } from '../../models/NotificacionModel';
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../environments/environment.development';
import { EstadoNotificacion } from '../../models/EnumsModel';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  // Obtener el apiURL desde environment
  private readonly apiUrl = environment.apiURL;
  private endpoint = environment.endPointNotificacion;
  /**
   * Signal principal con el estado de las notificaciones leídas
   * Se inicializa leyendo localStorage
   */

  private notificacionesNoLeidas = signal<NotificacionModel[]>(this.loadNotisFromStorage());

  /**
   * Signal para recargar notificaciones en el header
   */
  private recargarNotis = signal<number>(0);

  /**
   * Signal computado para que el header se subscriba al cambio
   */
  readonly recargar = computed(() => this.recargarNotis());

  /**
   * Observable reactivo: lista completa de las notificaciones
   */

  readonly notificaciones = computed(() => this.notificacionesNoLeidas());

  // Cantidad total de notificaciones
  readonly qtyItems = computed(() => this.notificacionesNoLeidas().length);

  
  /**
   * Método para forzar la recarga de notificaciones en el header
   */
  triggerRecarga(): void {
    this.recargarNotis.set(this.recargarNotis() + 1); // Incrementar el valor para forzar la recarga
  }

  /**
   * Método constructor de la clase
   */
  constructor(private http: HttpClient) {
    /**
     * Guardar automáticamente cambios en localStorage
     */

    effect(() => {
      localStorage.setItem('notificacionesNoLeidas', JSON.stringify(this.notificacionesNoLeidas()));
    });
  }

  // Leer notificacionesNoLeidas desde localStorage
  private loadNotisFromStorage(): NotificacionModel[] {
    try {
      const data = localStorage.getItem('notificacionesNoLeidas');

      if (!data) {
        return [];
      }

      return JSON.parse(data) as NotificacionModel[];
    } catch {
      return [];
    }
  }

  /**
   * Método para formatear las notificaciones
   */
  private formatearNotificaciones(data: NotificacionModel[]): NotificacionModel[] {
    // Recorrer los elementos del array de data para cortar el mensaje
    // si el tipo de notificacion es TICKET_ASIGNADO
    const notificacionesFormateadas = data.map((noti) => {
      if (noti.tipo === 'TICKET_ASIGNADO' && noti.mensaje && noti.mensaje.length > 55) {
        return {
          ...noti,
          mensaje: noti.mensaje.substring(0, 55) + '...',
        };
      }
      return noti;
    });

    return notificacionesFormateadas;
  }

  /**
   * Obtener las notificaciones desde la base de datos
   */
  cargarNotificaciones(usuarioId: number, formatear: boolean = true): void {
    console.log('Cargando notificaciones para usuarioId:', usuarioId);
    this.getNotificacionesNoLeidas(usuarioId).subscribe({
      next: (notificaciones) => {
        console.log('Notificaciones cargadas:', notificaciones);
        console.log('Cantidad de notificaciones: ', notificaciones.length);

        // Formatear las notificaciones dependiendo de dónde provienen
        let notificacionesFormateadas = null;

        if (formatear) {
          notificacionesFormateadas = this.formatearNotificaciones(notificaciones);
        } else {
          notificacionesFormateadas = notificaciones;
        }
        //Actualizar la signal con las notificaciones obtenidas
        this.notificacionesNoLeidas.set(notificacionesFormateadas);
      },
      error: (error) => {
        console.error('Error al cargar notificaciones:', error);
      },
    });
  }

  /**
   * Agregar una nueva notificación no leída
   */
  addNotificacion(notificacion: NotificacionModel, quantity?: number): void {
    this.notificacionesNoLeidas.update((current) => {
      // Verificar si la notificación ya existe
      const existe = current.some((item) => item.id === notificacion.id);

      // Si la notificación ya existe, no agregar
      if (existe) {
        return current;
      }
      // Agregar la nueva notificación al inicio de la lista
      return [notificacion, ...current];
    });
  }

  /**
   * Marcar una notificación como leída (eliminar de la lista)
   */
  marcarComoLeida(notificacionId: number): void {
    // Actualizar en BD primero
    this.actualizarNotificacion(notificacionId).subscribe({
      next: (response) => {

      console.log('Respuesta del backend:', response);
      console.log('ID:', response.id);
      console.log('Estado:', response.estado);
      console.log('Leído en:', response.leidoAt);


        // Si la BD se actualiza bien, actualizar localmente y mostrar en leidas
      this.notificacionesNoLeidas.update((current) =>
        current.map((item) =>
          item.id === notificacionId
            ? { ...item, estado: 'LEIDA' as EstadoNotificacion, leidoAt: response.leidoAt }
            : item
        )
      );
      
      console.log('Notificación eliminada localmente');
    },
    error: (error) => {
      console.error('Error al actualizar en BD:', error);
      console.error('Mensaje:', error.message);
      console.error('Status:', error.status);
    }
  });
}

  /**
   * Vaciar todas las notificaciones no leídas
   */
  vaciarNotificaciones(): void {
    this.notificacionesNoLeidas.set([]);
  }

  /**
   * Obtener la lista actual de notificaciones no leídas
   */
  getNotificacionesNoLeidas(usuarioId: number): Observable<NotificacionModel[]> {
    return this.http.get<NotificacionModel[]>(`${this.apiUrl}/${this.endpoint}/${usuarioId}`);
  }

  /**
   * Actualizar una notificación como leída en el backend
   */
  /*actualizarNotificacion(notificacionId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${this.endpoint}/marcar-leida/${notificacionId}`, {});
  }*/
  actualizarNotificacion(notificacionId: number): Observable<any> {
  const url = `${this.apiUrl}/${this.endpoint}/marcar-leida/${notificacionId}`;
  
  console.log('[SERVICE] Llamando a URL:', url);
  console.log('[SERVICE] ID de notificación:', notificacionId);
  
  return this.http.put(url, {});
}



}
