import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TecnicoDetail } from './tecnico-detail/tecnico-detail';
import { TecnicoIndex } from './tecnico-index/tecnico-index';
import { TecnicoForm } from './tecnico-form/tecnico-form';

// Definición de rutas para el módulo de técnico
const routes: Routes = [

  // Ruta para el componente de lista de técnicos
  { path: 'tecnico', component: TecnicoIndex },

  // Ruta para el componente de creación de técnico
  { path: 'tecnico/create', component: TecnicoForm },

  // Ruta para el componente de edición de técnico
  { path: 'tecnico/edit/:id', component: TecnicoForm },

  // Ruta para el componente de detalle de técnico
  {
    path: 'tecnico/:id',
    component: TecnicoDetail,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TecnicoRoutingModule { }
