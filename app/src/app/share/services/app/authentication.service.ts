import { Injectable, computed, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UsuarioModel } from '../../models/UsuarioModel';
import { environment } from '../../../../environments/environment.development';
// import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly apiUrl = environment.apiURL;
  private readonly tokenKey = 'currentUser';

  /**
   * Signal que mantiene el token JWT
   * Se inicializa leyendo desde LocalStorage para mantener sesión tras refrescar página
   */
  tokenUser = signal<string | null>(localStorage.getItem(this.tokenKey));

  /** Indica si hay sesión activa */
  authenticated = computed(() => !!this.tokenUser());

  /** Datos del usuario logueado */
  usuario = signal<UsuarioModel | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    // private cartService: CartService
  ) {
    /**
     * Effect: Se ejecuta cada vez que el token cambia
     * Si existe token → se obtiene el perfil del usuario
     */
    effect(() => {
      const token = this.tokenUser();
      if (token && !this.usuario()) {
        this.getUserProfile().subscribe();
      }
    });
  }

  /**
   * LOGIN
   * - Guarda token en LocalStorage
   * - Actualiza signal
   */
  loginUser(credentials: { email: string; password: string }): Observable<{ success: boolean }> {
    
    // Mapear los campos del frontend a los esperados por el backend

    // Crear objeto con el correo y la contraseña hasheada
    const payload = {
      correo: credentials.email,
      contrasenaHash: credentials.password,
    };

    // Realizar la petición POST al endpoint de login
    return this.http
      .post<{ success: boolean; message: string; token: string }>(`${this.apiUrl}/usuario/login`, payload)
      .pipe(

        // Utilizar tap para realizar efectos secundarios sin alterar el flujo del observable
        tap((response) => {

          // Revisar la respuesta del servidor, si es exitosa y contiene token
          if (response.success && response.token) {
            const strToken = String(response.token); // Castear el token a string
            localStorage.setItem(this.tokenKey, strToken); // Guardar token en LocalStorage del navegador
            this.tokenUser.set(strToken); // Actualizar signal "tokenUser" con el nuevo token
          }
        })
      );
  }

  /**
   * Obtener perfil de usuario desde API
   * - Si falla: se hace logout seguro
   */
  getUserProfile(): Observable<UsuarioModel | null> {
    return this.http.get<UsuarioModel>(`${this.apiUrl}/usuario/profile`).pipe(
      tap((user) => {
        this.usuario.set(user)
      }),
      catchError(() => {
        this.logout(); 
        return of(null);
      })
    );
  }

  /**
   * LOGOUT
   * - Limpiar signals
   * - Limpia LocalStorage del navegador
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.tokenUser.set(null);
    this.usuario.set(null);

    this.router.navigate(['/usuario/login']);
  }
}
