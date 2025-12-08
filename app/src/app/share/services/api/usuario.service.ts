import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { UsuarioModel } from '../../models/UsuarioModel';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs/internal/Observable';


// Interfaz para la respuesta de listado de usuarios paginados
export interface UsuariosPaginado {
  usuarios: UsuarioModel[];
  total: number;
  pagina: number;
  porPagina: number;
}

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

  /**
   * Función para restablecer la contraseña de un usuario
   */
  resetPassword(nombreUsuario: string, nuevaContrasenna: string) {
    console.log(`[SERVICIO] Enviando solicitud de restablecimiento de contraseña a: ${this.urlAPI}/${environment.endPointUsuario}/reset-password/${nombreUsuario}`, nuevaContrasenna);
    const payload = { nuevaContrasenna };
    return this.http.put<{ message: string }>(`${this.urlAPI}/${environment.endPointUsuario}/reset-password/${nombreUsuario}`, payload);
  }

  /**
   * Obtiene usuarios con paginación
   */
  getUsuariosPaginado(pagina: number, limite: number): Observable<UsuariosPaginado> {

    return this.http.get<UsuariosPaginado>(
      `${this.urlAPI}/${environment.endPointUsuario}?pagina=${pagina}&limite=${limite}`
    );
  }
}