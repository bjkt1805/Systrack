import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { TicketModel } from '../../models/TicketModel';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs/internal/Observable';

// Interfaz para la respuesta de listado de tickets por usuario
export interface TicketsByUsuario {
  tickets: TicketModel[];
  total: number;
  pagina: number;
  porPagina: number;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService extends BaseAPI<TicketModel> {

  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      environment.endPointTicket);
  }

  /**
   * Obtiene tickets filtrados por usuario y rol con paginación
   * 
   * - ADMINISTRADOR: Todos los tickets
   * - CLIENTE: Solo tickets creados por el usuario
   * - TECNICO: Solo tickets asignados al técnico
   * 
   * Ejemplo: GET http://localhost:3000/ticket/usuario/5?rol=CLIENTE&pagina=1&limite=5
   */
  getTicketsByUsuario(usuarioId: number, rol: string, pagina: number, limite: number): Observable<TicketsByUsuario> {

    return this.http.get<TicketsByUsuario>(
      `${this.urlAPI}/${environment.endPointTicket}/usuario/${usuarioId}?rol=${rol}&pagina=${pagina}&limite=${limite}`
    );
  }

  /**
   * Obtiene tickets para el tablero Kanban filtrados por semana
   * @param fechaSemana - Fecha de la semana (opcional, por defecto semana actual)
   */
  getTicketsKanban(fechaSemana?: string): Observable<any> {
    const params = fechaSemana ? `?semana=${fechaSemana}` : '';
    return this.http.get<any>(
      `${this.urlAPI}/${environment.endPointTicket}/kanban${params}`
    );
  }

  /** 
   * Modificar el método de creación de tickets para aceptar FormData
   */
  createTiquete(formData: FormData): Observable<TicketModel> {
    return this.http.post<TicketModel>(`${this.urlAPI}/${environment.endPointTicket}`,formData);
  }

  /**
   * Modificar el método de actualización de tickets para aceptar FormData
   */
  updateTiquete(ticketId: number,formData: FormData): Observable<TicketModel> {
    return this.http.put<TicketModel>(`${this.urlAPI}/${environment.endPointTicket}/${ticketId}`, formData);
  }

  /**
   * Actualizar el estado del tiquete con historial e imágenes
   * @param ticketId ID del tiquete
   * @param payload { nuevoEstado, nota, usuarioAsignadoId?, imagenes[]}
   */
  updateEstado(ticketId: number, payload: any): Observable<any>{
    return this.http.put(`${this.urlAPI}/${environment.endPointTicket}/${ticketId}/estado`,payload);
  }

}