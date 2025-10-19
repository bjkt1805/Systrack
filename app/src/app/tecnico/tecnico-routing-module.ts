import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TecnicoDetail } from './tecnico-detail/tecnico-detail';
import { TecnicoIndex } from './tecnico-index/tecnico-index';

// Definición de rutas para el módulo de técnico
const routes: Routes = [

  // Ruta para el componente de lista de técnicos
  { path: 'tecnico', component: TecnicoIndex },

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
