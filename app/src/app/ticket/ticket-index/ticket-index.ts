import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketModel } from '../../share/models/TicketModel';
import { TicketService } from '../../share/services/api/ticket.service';
import { UsuarioService } from '../../share/services/api/usuario.service';
  
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

  // Inyectar el servicio de TicketService
  private ticketService = inject(TicketService);

  // Inyectar el servicio de UsuarioService
  private usuarioService = inject(UsuarioService);

  // Inyectar Router y ActivatedRoute
  private router = inject(Router);

  // ===== VARIABLES DEL USUARIO LOGUEADO ID (HARDCODEADA) =====
  // Esta variable simula el usuario logueado
  // Posteriormente se obtendrá del servicio de autenticación
  USUARIO_LOGUEADO_ID: number = 4;

  // Signal para obtener el usuario logueado completo
  usuarioLogueado = signal<any>(null); 

  // Signal para estado de carga del usuario
  cargandoUsuario = signal<boolean>(false);

  // Signal para error al cargar el usuario
  errorUsuario = signal<string | null>(null);

  // Signal para ticket
  tickets = signal<TicketModel[]>([]);

  // Se utiliza una tabla para mostrar los tickets (dataSource de la tabla = MatTableDataSource usando TicketModel como fuente de datos)
  dataSource = new MatTableDataSource<TicketModel>();

  // Columnas a utilizar en la tabla
  displayedColumns = ['titulo', 'descripcion', 'estado', 'prioridad', 'acciones'];
  
  // ngOnInit para inicializar el paginador y sus labels en español
  // junto con la carga de usuarios desde el servicio y luego asignarlos a la signal

  ngOnInit(): void {

    // Llamar al método para configurar el paginador
    this.configurarPaginador();

    // Cargar el usuario logueado
    this.cargarUsuarioLogueado();
  }

  // Método para configurar los labels del paginador en español
  configurarPaginador(): void {
    this.paginator._intl.itemsPerPageLabel = 'Items por página:';
    this.paginator._intl.nextPageLabel = 'Siguiente';
    this.paginator._intl.previousPageLabel = 'Anterior';
    this.paginator._intl.firstPageLabel = 'Inicio';
    this.paginator._intl.lastPageLabel = 'Fin';
  }

  cargarUsuarioLogueado(): void {
    this.cargandoUsuario.set(true);
    this.errorUsuario.set(null);

    console.log(`Cargando información del usuario ID: ${this.USUARIO_LOGUEADO_ID}`);

    this.usuarioService.getById(this.USUARIO_LOGUEADO_ID)
      .subscribe({
        next: (usuario) => {
          console.log('Usuario logueado cargado:', usuario);
          this.usuarioLogueado.set(usuario);
          this.cargandoUsuario.set(false);

          // Una vez que se carga el usuario, cargar sus tickets
          this.cargarTickets();
        },
        error: (error) => {
          console.error('Error al cargar usuario logueado:', error);
          this.errorUsuario.set('Error al cargar información del usuario');
          this.cargandoUsuario.set(false);
        }
      });
  }
 
  // Método que se ejecuta cuando cambia la página en el paginador
  onPageChange(event: PageEvent): void {
    // El paginador ya actualiza automáticamente pageIndex y pageSize
    // y también llama a cargarTickets()
    this.cargarTickets();
  }

  //Listar todos los tickets del API (localhost:3000/ticket) filtrados por el usuario 
  // seleccionado 
  cargarTickets(): void {

    // Utilizar el dato del usuario logueado para filtrar los tickets
    const usuario = this.usuarioLogueado();

    // Verificar si el usuario está logueado
    if (!usuario) {
      console.warn('No hay usuario logueado');
      return;
    }

    // Asignar al objeto los valores del usuario logueado (id y rol)
    const { id, rol } = usuario;

    // Asignar a pagina y tamanoPagina los valores del paginador
    const pagina = this.paginator.pageIndex + 1;
    const tamanoPagina = this.paginator.pageSize;

    // Console log para cargar los tickets específicos del usuario
    console.log(`Cargando tickets para usuario ID: ${id}, Rol: ${rol}`);

    //localhost:3000/ticket/usuario/1
    this.ticketService.getTicketsByUsuario(id, rol, pagina, tamanoPagina)
      .subscribe({
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

  // Navegar al detalle de un ticket
  detalleTicket(id: number) {
    this.router.navigate(['/ticket', id]);
  }
}
