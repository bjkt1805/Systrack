import { Component, inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { AuthenticationService } from '../../share/services/app/authentication.service';

@Component({
    selector: 'app-usuario-index',
    standalone: false,
    templateUrl: './usuario-index.html',
    styleUrls: ['./usuario-index.css'],
})

export class UsuarioIndex implements OnInit {

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    // Inyectar servicios
    private usuarioService = inject(UsuarioService);
    private router = inject(Router);
    private authService = inject(AuthenticationService);

    // Signals para autenticación
    readonly isAuthenticated = this.authService.authenticated;
    readonly currentUser = this.authService.usuario;

    // Signal para usuarios
    usuarios = signal<UsuarioModel[]>([]);

    // Signal para estado de carga
    cargando = signal<boolean>(false);

    // Signal para error
    error = signal<string | null>(null);

    // DataSource para la tabla
    dataSource = new MatTableDataSource<UsuarioModel>();

    // Columnas a mostrar en la tabla
    displayedColumns = ['nombreUsuario', 'nombreCompleto', 'correo', 'rol', 'estado'];

    

    paginaActual = 1; 
    tamannoPagina = 5; 

    ngOnInit(): void {

        // Cargar usuarios
        this.cargarUsuarios();

        // Configurar ordenamiento
        // this.dataSource.sort = this.sort;
    }

    // El paginador no se carga bien en el método OnInit, hay
    // que usar AfterViewInit para que se cargue hasta que 
    // se inicialice el componente
    // ngAfterViewInit(): void {

    //     // Configurar paginador y sort DESPUÉS de que la vista esté lista
    //     this.configurarPaginador();

    //     // Configurar ordenamiento
    //     this.dataSource.sort = this.sort;
    //     this.dataSource.paginator = this.paginator;
    // }

    /**
     * Configurar labels del paginador
     */
    configurarPaginador(): void {

        if (!this.paginator) return;

        this.paginator._intl.itemsPerPageLabel = 'Items por página:';
        this.paginator._intl.nextPageLabel = 'Siguiente';
        this.paginator._intl.previousPageLabel = 'Anterior';
        this.paginator._intl.firstPageLabel = 'Inicio';
        this.paginator._intl.lastPageLabel = 'Fin';
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0) return `0 de ${length}`;
            const startIndex = page * pageSize;
            const endIndex = Math.min(startIndex + pageSize, length);
            return `${startIndex + 1} - ${endIndex} de ${length}`;
        };
    }

    /**
     * Cargar usuarios desde el servicio
     */
    cargarUsuarios(): void {
        this.cargando.set(true);
        this.error.set(null);

        console.log('[FRONTEND] Cargando listado de usuarios...');

        // CORRECTO: Verificar si paginator existe antes de acceder a sus propiedades
        const pagina = this.paginator ? this.paginator.pageIndex + 1 : this.paginaActual;
        const tamanoPagina = this.paginator ? this.paginator.pageSize : this.tamannoPagina;

        // // Asignar pagina y tamanoPagina los valores del paginador
        // const pagina = this.paginator.pageIndex + 1;
        // const tamanoPagina = this.paginator.pageSize; 

        this.usuarioService.get()
            .subscribe({
                next: (usuarios) => {
                    console.log('[FRONTEND] Usuarios cargados:', usuarios);
                    this.usuarios.set(usuarios);
                    this.dataSource.data = usuarios;
                    // this.paginator.length = this.paginator ? response.total : this.paginaActual;
                    // if (this.paginator) {
                    //     this.paginator.length = response.total; 
                    // }
                    this.cargando.set(false);
                },
                error: (error) => {
                    console.error('[FRONTEND] Error al cargar usuarios:', error);
                    this.error.set('Error al cargar la lista de usuarios');
                    this.cargando.set(false);
                }
            });
    }

    /**
     * Manejar cambio de página
     */
    onPageChange(event: PageEvent): void {
        console.log('[FRONTEND] Cambio de página:', event);
    }

    /**
     * Ver detalle de un usuario
     */
    verDetalle(id: number): void {
        this.router.navigate(['/usuario', id]);
    }

    /**
     * Navegar a crear nuevo usuario (registro)
     */
    crearUsuario(): void {
        this.router.navigate(['/usuario/register']);
    }

    /**
     * Obtener clase CSS para el badge del rol
     */
    getRolBadgeClass(rol: string): string {
        switch (rol) {
            case 'ADMIN':
                return 'badge--admin';
            case 'TECNICO':
                return 'badge--tecnico';
            case 'CLIENTE':
                return 'badge--cliente';
            default:
                return 'badge--default';
        }
    }

    /**
     * Obtener clase CSS para el badge del estado
     */
    getEstadoBadgeClass(activo: boolean): string {
        return activo ? 'badge--activo' : 'badge--inactivo';
    }

    /**
     * Obtener texto del estado
     */
    getEstadoTexto(activo: boolean): string {
        return activo ? 'Activo' : 'Inactivo';
    }
}