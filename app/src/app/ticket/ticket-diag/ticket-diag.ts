import { Component, Inject, inject, signal, effect } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TicketService } from '../../share/services/api/ticket.service';
import { TicketModel } from '../../share/models/TicketModel';
import { from } from 'rxjs';

@Component({
  selector: 'app-ticket-diag',
  standalone: false,
  templateUrl: './ticket-diag.html',
  styleUrl: './ticket-diag.css'
})
export class TicketDiag {
  // Signal para almacenar el ticket obtenido del API
  datos = signal<TicketModel | null>(null);

  // Datos recibidos al abrir el diálogo
  datosDialog: { id: number };

  // Inyectar servicios
  private ticketService = inject(TicketService);
  private dialogRef = inject(MatDialogRef<TicketDiag>);

  constructor(@Inject(MAT_DIALOG_DATA) data: { id: number }) {
    this.datosDialog = data;

    // Si hay ID, cargar los datos del ticket
    if (this.datosDialog?.id) {
      this.obtenerTicket(this.datosDialog.id);
    }
  }

  // Cargar ticket usando Signals y effect
  private obtenerTicket(id: number) {

    // La constante ticket$ tiene signo de dolar porque es un observable (se puede suscribir a él)
    const ticket$ = from(this.ticketService.getById(id));

    // Effect para suscribirse al observable y actualizar la Signal
    effect(() => {
      ticket$.subscribe({
        next: (data: TicketModel) => this.datos.set(data),
        error: (err) => console.error('Error cargando ticket:', err)
      });
    });
  }

  // Cerrar diálogo
  close() {
    this.dialogRef.close();
  }
}