import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { UsuarioModel } from '../../models/UsuarioModel';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class TecnicoService extends BaseAPI<UsuarioModel> {

  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      environment.endPointTecnico);
  }

  // Traer todos los técnicos disponibles y activos
  getAvailable(): Observable<any> {
    return this.http.get<any>(`${this.urlAPI}/${environment.endPointTecnico}/available`);
  }
}