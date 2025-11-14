import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../share/services/app/authentication.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  constructor(private router: Router) { }
  // constructor(private router: Router, private authService: AuthenticationService) {} // PARA CUANDO SIRVA AUTENTICACION

  /**
   * Signals para manejar la autenticación de usuario 
   * PARA CUANDO SIRVA AUTENTICACION
   */
  // readonly isAuthenticated = this.authService.authenticated;
  // readonly currentUser = this.authService.usuario;
  // this.currentUser()?.id // Acceder al id del usuario 

  /**
   * Signals computados para el control de roles 
   * readonly rol = computed(() => {
      const user = this.currentUser();
      return typeof user?.rol === 'string'
      ? user.rol // ej. "ADMIN"
      : user?.rol?.nombre ?? null;
      });
    readonly isAdmin = computed(() => this.rol() === 'ADMIN');
    readonly isClient = computed(() => this.rol() === 'CLIENTE');
   */

  // Para regresar a la vista de inicio
  irInicio(): void {
    this.router.navigate(['/']);
  }
}
