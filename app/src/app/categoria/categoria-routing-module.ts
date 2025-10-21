import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriaDetail } from './categoria-detail/categoria-detail';
import { CategoriaIndex } from './categoria-index/categoria-index';

// Definición de rutas para el módulo de categoría
const routes: Routes = [

  // Ruta para el componente de lista de categorías
  { path: 'categoria', component: CategoriaIndex },

  // Ruta para el componente de detalle de categoría
  {
    path: 'categoria/:id',
    component: CategoriaDetail,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriaRoutingModule { }
