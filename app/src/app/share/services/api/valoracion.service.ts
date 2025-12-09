import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ValoracionServicioModel } from '../../models/ValoracionServicioModel';

@Injectable({
  providedIn: 'root'
})
export class ValoracionService {
  private apiUrl = 'http://localhost:3000/valoracion';

  constructor(private http: HttpClient) {}

  /**
   * Crear una nueva valoración para un ticket
   * @param valoracion Datos de la valoración
   * @returns Observable con la valoración creada
   */
  create(valoracion: Partial<ValoracionServicioModel>): Observable<ValoracionServicioModel> {
    return this.http.post<ValoracionServicioModel>(this.apiUrl, valoracion);
  }

  /**
   * Verificar si un ticket ya tiene valoración
   * @param ticketId ID del ticket
   * @returns Observable con booleano indicando si existe valoración
   */
  existeValoracion(ticketId: number): Observable<{ existe: boolean }> {
    return this.http.get<{ existe: boolean }>(`${this.apiUrl}/existe/${ticketId}`);
  }

  /**
   * Obtener valoración por ticket ID
   * @param ticketId ID del ticket
   * @returns Observable con la valoración del ticket
   */
  getByTicketId(ticketId: number): Observable<ValoracionServicioModel> {
    return this.http.get<ValoracionServicioModel>(`${this.apiUrl}/ticket/${ticketId}`);
  }

  /**
   * Obtener promedio de valoraciones por técnico
   * @param tecnicoId ID del técnico
   * @returns Observable con el promedio
   */
  getPromedioByTecnico(tecnicoId: number): Observable<{ promedio: number; total: number }> {
    return this.http.get<{ promedio: number; total: number }>(`${this.apiUrl}/promedio/tecnico/${tecnicoId}`);
  }

  /**
   * Listar valoraciones (con filtros opcionales por rol)
   * @param filtros Filtros opcionales
   * @returns Observable con listado de valoraciones
   */
  get(filtros?: { creadoPorId?: number; tecnicoId?: number }): Observable<ValoracionServicioModel[]> {
    let params: any = {};
    if (filtros?.creadoPorId) params.creadoPorId = filtros.creadoPorId;
    if (filtros?.tecnicoId) params.tecnicoId = filtros.tecnicoId;
    
    return this.http.get<ValoracionServicioModel[]>(this.apiUrl, { params });
  }
}