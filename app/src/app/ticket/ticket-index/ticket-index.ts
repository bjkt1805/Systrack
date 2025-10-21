import { Component, inject, signal, ViewChild } from '@angular/core';
import {  MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketModel } from '../../share/models/TicketModel';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
// import { TicketDiag } from '../ticket-diag/ticket-diag';
import { TicketService } from '../../share/services/api/ticket.service';
//import { TicketDiag } from '../ticket-image-view-dialog/ticket-image-view-dialog';
  
@Component({
  selector: 'app-ticket-index',
  standalone: false,
  templateUrl: './ticket-index.html',
  styleUrl: './ticket-index.css',
})
export class TicketIndex {
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  //Cambio TicketModel

  // Se utiliza una tabla para mostrar los tickets
  dataSource = new MatTableDataSource<TicketModel>();
  
  // Signals
  tickets = signal<TicketModel[]>([]);

  // Columnas a utilizar en la tabla
  displayedColumns = ['titulo', 'descripcion', 'estado', 'prioridad', 'acciones'];
  
  // Inyectar MatDialog para los diálogos
  readonly dialog = inject(MatDialog);

  // Método constructor 
  constructor(
    private ticketService: TicketService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.listTickets()
  }
 

  // ngOnInit para inicializar el paginador y los labels
  ngOnInit() {

    //Label paginator
    this.paginator._intl.itemsPerPageLabel = 'Items';
    this.paginator._intl.nextPageLabel = 'Siguiente';
    this.paginator._intl.previousPageLabel = 'Anterior';
    this.paginator._intl.firstPageLabel = 'Inicio';
    this.paginator._intl.lastPageLabel = 'Fin';
  }

  //Listar todos los tickets del API
  listTickets() {

    //localhost:3000/ticket
    this.ticketService.get().subscribe((respuesta: TicketModel[]) => {
      console.log("Lista de tickets: ", respuesta);
      //Cambio
      this.tickets.set(respuesta);
      this.dataSource.data=this.tickets()
      
      // Actualiza la signal
      this.tickets.set(respuesta);

      // Actualiza dataSource.data
      this.dataSource.data = this.tickets();

      // Re-asignar paginator y sort después de cambiar los datos
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  // Navegar al detalle de un ticket
  detalleTicket(id: number) {
    this.router.navigate(['/ticket', id]);
  }
}
