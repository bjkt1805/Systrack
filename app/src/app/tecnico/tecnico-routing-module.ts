import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TecnicoDetail } from './tecnico-detail/tecnico-detail';
import { TecnicoIndex } from './tecnico-index/tecnico-index';
import { TecnicoForm } from './tecnico-form/tecnico-form';
import { authGuard } from '../share/guards/auth.guard';

// Definición de rutas para el módulo de técnico
const routes: Routes = [

  // Ruta para el componente de lista de técnicos
  { path: 'tecnico', component: TecnicoIndex, canActivate: [authGuard], data: { roles: ['ADMIN'] } },

  // Ruta para el componente de creación de técnico
  { path: 'tecnico/create', component: TecnicoForm, canActivate: [authGuard], data: { roles: ['ADMIN'] } },

  // Ruta para el componente de edición de técnico
  { path: 'tecnico/edit/:id', component: TecnicoForm, canActivate: [authGuard], data: { roles: ['ADMIN'] } },

  // Ruta para el componente de detalle de técnico
  {
    path: 'tecnico/:id',
    component: TecnicoDetail,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TecnicoRoutingModule { }
