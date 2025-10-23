import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import {  MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketModel } from '../../share/models/TicketModel';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
// import { TicketDiag } from '../ticket-diag/ticket-diag';
import { TicketService } from '../../share/services/api/ticket.service';
import { UsuarioService } from '../../share/services/api/usuario.service';
//import { TicketDiag } from '../ticket-image-view-dialog/ticket-image-view-dialog';
  
@Component({
  selector: 'app-ticket-index',
  standalone: false,
  templateUrl: './ticket-index.html',
  styleUrl: './ticket-index.css',
})

// A la hora de exportar la clase, se implementa OnInit
export class TicketIndex implements OnInit{
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Inyectar los servicios de TicketService y UsuarioService
  private ticketService = inject(TicketService);
  private usuarioService = inject(UsuarioService);

  // Inyectar Router y ActivatedRoute
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signal para ticket
  tickets = signal<TicketModel[]>([]);

  // Signal para usuarios
  usuarios = signal<{ id: number; nombreUsuario: string; rol: string }[]>([]);

  // Signal para el ID del usuario seleccionado
  usuarioId = signal<number | null>(null);

  // Signal para el rol del usuario seleccionado
  usuarioRol = signal<string | null>(null);

  // Se utiliza una tabla para mostrar los tickets (dataSource de la tabla = MatTableDataSource usando TicketModel como fuente de datos)
  dataSource = new MatTableDataSource<TicketModel>();

  // Columnas a utilizar en la tabla
  displayedColumns = ['titulo', 'descripcion', 'estado', 'prioridad', 'acciones'];
  
  // // Inyectar MatDialog para los diálogos
  // readonly dialog = inject(MatDialog);

  // ngOnInit para inicializar el paginador y sus labels en español
  // junto con la carga de usuarios desde el servicio y luego asignarlos a la signal

  ngOnInit(): void {

    // Cargar usuarios desde el servicio
    this.cargarUsuarios();

    //Label paginator
    this.paginator._intl.itemsPerPageLabel = 'Items';
    this.paginator._intl.nextPageLabel = 'Siguiente';
    this.paginator._intl.previousPageLabel = 'Anterior';
    this.paginator._intl.firstPageLabel = 'Inicio';
    this.paginator._intl.lastPageLabel = 'Fin';
  }
 
  // Método para cargar usuarios desde el servicio y asignarlos a la signal
  // El método no recibe parámetros y es void
  cargarUsuarios(): void {

    // Llamar al método get del servicio UsuarioService
    // y se subscribe a la respuesta para asignar los usuarios a la signal
    this.usuarioService.get().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
      }, 

      // En caso de haber error, se muestra en consola
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  // Método que se ejecuta cuando cambia el usuario en el select
  // recibe el id del usuario como parámetro y es void
  onUsuarioChange(id: number): void {

    // Buscar el rol del usuario seleccionado
    const usuario = this.usuarios().find(u => u.id === id);

    // Si el usuario existe, actualizar las signals de id y de rol 
    if (usuario) {
      this.usuarioId.set(usuario.id);
      this.usuarioRol.set(usuario.rol);
    }

    // Resetear el paginador a la primera página (index = 0) y cargar de nuevo los tickets 
    this.paginator.pageIndex = 0;
    this.listTickets();
  }

  //Listar todos los tickets del API (localhost:3000/ticket) filtrados por el usuario 
  // seleccionado 
  listTickets(): void {

    // Asignar a una constante idUsuario y rol los valores de las signals
    const idUsuario = this.usuarioId();
    const rol = this.usuarioRol();

    // Revisar si existe un idUsuario seleccionado o un rol
    // Si no existen, no cargar los ticket y retornar
    if (!idUsuario || !rol) {
      console.warn('Seleccione un usuario primero');
      this.dataSource.data = [];
      return;
    }

    // Paginación
    const pagina = this.paginator.pageIndex + 1;
    const tamanoPagina = this.paginator.pageSize; 

    //localhost:3000/ticket
    this.ticketService.getTicketsByUsuario(
      idUsuario,
      rol,
      pagina,
      tamanoPagina
    ).subscribe({
      next: (response) => {
        this.tickets.set(response.tickets);
        this.dataSource.data = response.tickets;
        this.paginator.length = response.total;
      },
      error: (error) => {
        console.error('Error al cargar tickets:', error);
      }
    });
  }

  // Limpiar filtro (limpiar signals y dataSource.data))
  limpiarFiltro(): void {
    this.usuarioId.set(null);
    this.usuarioRol.set(null);
    this.dataSource.data = [];
    this.paginator.pageIndex = 0;
  }

  // Navegar al detalle de un ticket
  detalleTicket(id: number) {
    this.router.navigate(['/ticket', id]);
  }
}
