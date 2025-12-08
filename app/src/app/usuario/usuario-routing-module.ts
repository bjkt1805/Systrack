import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuarioLogin } from './usuario-login/usuario-login';
import { UsuarioRegister } from './usuario-register/usuario-register';
import { UsuarioEdit } from './usuario-edit/usuario-edit';
import { UsuarioResetPassword } from './usuario-reset-password/usuario-reset-password';
import { UsuarioIndex } from './usuario-index/usuario-index';
import { authGuard } from '../share/guards/auth.guard';

const routes: Routes = [

  // Ruta para el componente de listado de usuarios 
  { path: 'usuario', component: UsuarioIndex, canActivate: [authGuard], data: { roles: ['ADMIN'] } },

  // Ruta para el componente de login de usuario
  { path: 'usuario/login', component: UsuarioLogin },

  // Ruta para el componente de creación de usuario (registro)
  { path: 'usuario/register', component: UsuarioRegister },

  // Ruta por defecto que redirige a edición de usuario
  { path: 'usuario/edit/:id', component: UsuarioEdit},

  // Ruta para reestablecer la contraseña 
  { path: 'usuario/reset-password', component: UsuarioResetPassword},


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }
