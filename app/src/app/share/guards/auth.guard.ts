import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from '../services/app/authentication.service';
import { NotificationService } from '../services/app/notification.service';
import { catchError, map, of, tap } from 'rxjs';

// No necesitamos la clase UserGuard como tal para una CanActivateFn
// sino que la lógica se integra directamente en la función.

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  const noti = inject(NotificationService);

  // Verifica token
  if (!authService.authenticated()) {
    noti.warning('Autorización', 'Debe iniciar sesión', 3000);
    return router.createUrlTree(['/usuario/login']);
  }

  // Espera a que el perfil esté cargado
  return authService.getUserProfile().pipe(
    tap(user => {
      if (!user) {
        noti.warning('Autorización', 'Sesión inválida', 3000);
        authService.logout();
      }
    }),
    map(user => {
      if (!user) return router.createUrlTree(['/usuario/login']);

      // const userRole =
      //   typeof user.rol === 'string'
      //     ? user.rol
      //     : user.rol?.nombre ?? '';
      
      const userRole = user.rol;

      const rolesAllowed: string[] = route.data['roles'] ?? [];

      if (rolesAllowed.length > 0 && !rolesAllowed.includes(userRole)) {
        noti.warning('Acceso Restringido', 'No tiene permisos', 3000);
        return router.createUrlTree(['/inicio']);
      }

      return true;
    }),
    catchError(() => {
      authService.logout();
      return of(router.createUrlTree(['/usuario/login']));
    })
  );
};
