import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { environment } from '../../../../environments/environment.development';
import { EtiquetaModel } from '../../models/EtiquetaModel';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class EtiquetaService extends BaseAPI<EtiquetaModel> {

  constructor(httpClient: HttpClient) {
    super(
      httpClient,
      environment.endPointEtiqueta);
  }

  /**
   * Obtiene categoria filtrada por categoría
   *
   * Ejemplo: GET http://localhost:3000/ticket/etiqueta/5
   */
  getCategoriaByEtiquetaId(etiquetaId: number): Observable<any> {

    return this.http.get<any>(
      `${this.urlAPI}/${environment.endPointEtiqueta}/${etiquetaId}/categorias`
    );
  }
}