import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificacionIndex } from './notificacion-index/notificacion-index';

// Definición de rutas para el módulo de técnico
const routes: Routes = [

  // Ruta para el componente de lista de notificaciones
  { path: 'notificacion', component: NotificacionIndex },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificacionRoutingModule { }
