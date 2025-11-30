import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificacionModel } from '../../models/NotificacionModel';
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../../environments/environment.development';

@Injectable({
    providedIn: 'root'
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
     * Observable reactivo: lista completa de las notificaciones
     */

    readonly notificaciones = computed(() => this.notificacionesNoLeidas());

    // Cantidad total de notificaciones
    readonly qtyItems = computed(() => this.notificacionesNoLeidas().length);

    /**
     * Método constructor de la clase
     */
    constructor(
        private http: HttpClient
    ) {

        /**
         * Guardar automáticamente cambios en localStorage
         */

        effect(() => {
            localStorage.setItem('notificacionesNoLeidas', JSON.stringify(this.notificacionesNoLeidas()));
        })
    }

    // Leer notificacionesNoLeidas desde localStorage
    private loadNotisFromStorage(): NotificacionModel[] {
        try{
            const data = localStorage.getItem('notificacionesNoLeidas');
            return data ? JSON.parse(data) : [];
        }
        catch {
            return [];
        }
    }

    /**
     * Obtener las notificaciones desde la base de datos 
     */
    cargarNotificaciones(usuarioId: number) : void {
        console.log("Cargando notificaciones para usuarioId:", usuarioId);
        this.getNotificacionesNoLeidas(usuarioId).subscribe({
            next: (notificaciones) => {
                console.log("Notificaciones cargadas:", notificaciones);
                console.log("Cantidad de notificaciones: ", notificaciones.length);
                //Actualizar la signal con las notificaciones obtenidas
                this.notificacionesNoLeidas.set(notificaciones);
            },
            error: (error) => {
                console.error('Error al cargar notificaciones:', error);
            }
        });
    }

    /**
     * Agregar una nueva notificación no leída
     */
    addNotificacion(notificacion: NotificacionModel, quantity?: number): void {
        this.notificacionesNoLeidas.update((current) => {

            // Verificar si la notificación ya existe 
            const existe = current.some(item => item.id === notificacion.id);

            // Si la notificación ya existe, no agregar
            if (existe) {
                return current;
            }
            // Agregar la nueva notificación al inicio de la lista
            return [notificacion, ...current];
        })
    }

    /**
     * Marcar una notificación como leída (eliminar de la lista)
     */
    marcarComoLeida(notificacionId: number): void {
        this.notificacionesNoLeidas.update((current) => 
            current.filter(item => item.id !== notificacionId)
        );
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
    actualizarNotificacion(notificacionId: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/${this.endpoint}/marcar-leida/${notificacionId}`, {});
    }

}

