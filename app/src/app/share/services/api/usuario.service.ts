import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { UsuarioModel } from '../../models/UsuarioModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService extends BaseAPI<UsuarioModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointUsuario);
      }

    /** 
     * Función para registrar un nuevo usuario
     */
    registerUser(userData: any) {
        console.log(`[SERVICIO] Enviando soliticud de registro de usuario a: ${this.urlAPI}/${environment.endPointUsuario}/register`, userData);
        return this.http.post<UsuarioModel>(`${this.urlAPI}/${environment.endPointUsuario}/register`, userData);
    }
}