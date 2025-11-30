import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificacionesService } from '../../share/services/app/notificaciones.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {

  // constructor(private router: Router) { }

  // Inyección de dependencias
  // Hay que inyectar el servicio de autenticación para obtener el usuario autenticado
  private router = inject(Router);
  private authService = inject(AuthenticationService);
  private translate = inject(TranslateService);
  notificacionesService = inject(NotificacionesService);

  /**
   * Signals para manejar la autenticación de usuario 
   */
  readonly isAuthenticated = this.authService.authenticated;
  readonly currentUser = this.authService.usuario;
  readonly qtyItems = this.notificacionesService.qtyItems;

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

  // Método constructor para poder traerse desde el backend las notificaciones no leídas
  // del usuario. Se utiliza effect. 
  constructor() {
    effect(() => {
      const usuarioId = this.currentUser()?.id;

      // Cargar las notificaciones no leídas del usuario solo si se ha cargado 
      if (usuarioId) {
        this.notificacionesService.cargarNotificaciones(usuarioId);
      }
    });
  }
  // Cargar las notificaciones no leídas en el init
  ngOnInit(): void {
    const usuarioId = this.currentUser()?.id;
    if (usuarioId) {
      this.notificacionesService.cargarNotificaciones(usuarioId);
      console.log("Llamando al servicio para cargar notificaciones no leídas");
    }
  }

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
    this.notificacionesService.vaciarNotificaciones(); // Vaciar las notificaciones al hacer logout
    this.authService.logout(); // Llamar al método logout del servicio de autenticación
    this.router.navigate(['/usuario/login']); // Redirigir a la página de login después del logout
  }

  // Para cambiar el idioma
  cambiarIdioma(lang: 'en' | 'es'): void {
    this.translate.use(lang);
    localStorage.setItem('selectedLanguage', lang);
  }
}
