import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketAdmin } from './ticket-admin/ticket-admin';
import { TicketDetail } from './ticket-detail/ticket-detail';
import { TicketIndex } from './ticket-index/ticket-index';
import { TicketForm } from './ticket-form/ticket-form';

const routes: Routes = [

  // Ruta para la vista de lista de tickets
  { path: 'ticket', component: TicketIndex },

  // Ruta para la vista de administración de tickets
  { path: 'ticket-admin', component: TicketAdmin },

  // Ruta para el componente de creación de ticket
  { path: 'ticket/create', component: TicketForm },

  // Ruta para el componente de edición de ticket
  { path: 'ticket/edit/:id', component: TicketForm },

  // Ruta para la vista de detalle de un ticket
  {
    path: 'ticket/:id',
    component: TicketDetail,
  },

  // 

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketRoutingModule { }
