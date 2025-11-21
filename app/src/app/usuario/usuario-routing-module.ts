import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuarioLogin } from './usuario-login/usuario-login';
import { UsuarioRegister } from './usuario-register/usuario-register';

const routes: Routes = [

  // Ruta para el componente de login de usuario
  { path: 'usuario/login', component: UsuarioLogin },

  // Ruta para el componente de creación de usuario (registro)
  { path: 'usuario/register', component: UsuarioRegister },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }
