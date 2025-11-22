import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../share/services/app/authentication.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  // constructor(private router: Router) { }

  // Método constructor con inyección de dependencias. 
  // Hay que inyectar el servicio de autenticación para obtener el usuario autenticado
  private router = inject(Router);
  private authService = inject(AuthenticationService);

  /**
   * Signals para manejar la autenticación de usuario 
   */
  readonly isAuthenticated = this.authService.authenticated;
  readonly currentUser = this.authService.usuario;

  /**
   * Signal computador para obtener 
   * el rol del usuario
  */
  readonly rol = computed(() => {
    const user = this.currentUser();
    return typeof user?.rol === 'string'
      ? user.rol // ej. "ADMIN" / "CLIENTE" / "TÉCNICO"
      : null;
  });

  /** Signals computados para verificar roles específicos
   * isAdmin = "ADMIN"; isClient = "CLIENTE"; isTechnician = "TÉCNICO"
   */
  readonly isAdmin = computed(() => this.rol() === 'ADMIN');
  readonly isClient = computed(() => this.rol() === 'CLIENTE');
  readonly isTechnician = computed(() => this.rol() === 'TECNICO');

  // Acceder al id del usuario 
  getCurrentUserId(): number | null | undefined {
    return this.currentUser()?.id;
  }

  // Para regresar a la vista de inicio
  irInicio(): void {
    this.router.navigate(['/']);
  }

  // Para ir a la vista de login
  irLogin(): void {
    this.router.navigate(['/usuario/login']);
  }

  // Para desloguearse
  logout = () => {
    this.authService.logout(); // Llamar al método logout del servicio de autenticación
    this.router.navigate(['/']); // Redirigir a la página de inicio después del logout
  }

}
