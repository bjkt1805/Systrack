import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsignacionIndex } from './asignacion-index/asignacion-index';

// Definición de rutas para el módulo de técnico
const routes: Routes = [

  // Ruta para el componente de vista de asignaciones
  { path: 'asignacion', component: AsignacionIndex },

  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsignacionRoutingModule { }
