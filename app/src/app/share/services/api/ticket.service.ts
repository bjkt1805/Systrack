import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { TicketModel } from '../../models/TicketModel';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs/internal/Observable';

// Interfaz para la respuesta paginada de tickets
export interface TicketsPaginados {
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
    getTicketsByUsuario(
      usuarioId: number,
      rol: string,
      pagina: number = 1,
      limite: number = 5
    ): Observable<TicketsPaginados> {
      const params = `?rol=${rol}&pagina=${pagina}&limite=${limite}`;
      return this.http.get<TicketsPaginados>(
        `${this.urlAPI}/${environment.endPointTicket}/usuario/${usuarioId}${params}`
      );
    }
}