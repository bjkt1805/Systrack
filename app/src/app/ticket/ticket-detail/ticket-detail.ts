import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TecnicoService } from '../../share/services/api/tecnico.service';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { TicketModel } from '../../share/models/TicketModel';
import { TicketService } from '../../share/services/api/ticket.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: false,
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css'
})
export class TicketDetail {

  // Signal para almacenar los datos del ticket
  datos = signal<TicketModel | null>(null);

  // Inyectar servicio para llamar al detalle del ticket
  private ticketService = inject(TicketService);

  // Para obtener el parámetro de la ruta 
  private route = inject(ActivatedRoute);

  // Para redireccionar
  private router = inject(Router);

  constructor() {

    // Para obtener el id/parámetro de la ruta
    // Parsear el id a número
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Validación básica del id y enviarlo como parámetro al método obtenerTicket
    if (!isNaN(id)) {
      this.obtenerTicket(id);
    }
  }

  // Obtener ticket y actualizar la Signal
  obtenerTicket(id: number) {
    this.ticketService.getById(id).subscribe((data: TicketModel) => {
      console.log(data);
      this.datos.set(data); // Actualiza la Signal
    });
  }

  // Para regresar a la vista de lista de tickets
  goBack(): void {
    this.router.navigate(['/ticket/']);
  }

}
