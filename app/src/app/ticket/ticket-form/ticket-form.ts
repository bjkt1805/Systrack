import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, startWith, map } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../share/services/app/notification.service';

// Modelos
import { TicketModel } from '../../share/models/TicketModel';
import { EtiquetaModel } from '../../share/models/EtiquetaModel';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { Prioridad, EstadoTicket } from '../../share/models/EnumsModel';

// Servicios
import { TicketService } from '../../share/services/api/ticket.service';
import { EtiquetaService } from '../../share/services/api/etiqueta.service';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { UsuarioService } from '../../share/services/api/usuario.service';

@Component({
  selector: 'app-ticket-form',
  standalone: false,
  templateUrl: './ticket-form.html',
  styleUrl: './ticket-form.css'
})

export class TicketForm {

  // Subject para controlar la destrucción de suscripciones y evitar memory leaks
  private destroy$ = new Subject<void>();

  // Título del formulario, id del ticket y bandera de creación
  titleForm = 'Crear Ticket';
  idTicket: number | null = null;
  isCreate = true;

  // Usuario solicitante simulado (sin autenticación)
  // EN AVANCES POSTERIORES, ESTO VENDRÍA DEL CONTEXTO DE AUTENTICACIÓN
  private readonly USUARIO_SOLICITANTE_ID = 9; // Cliente: maria.rodriguez
  usuarioSolicitante: UsuarioModel | null = null;

  // Listas de datos (etiquetas, etiquetas filtradas, prioridades y categoria ) con signals
  etiquetasList = signal<EtiquetaModel[]>([]);
  etiquetasFiltered = signal<EtiquetaModel[]>([]);
  prioridadesList = signal<{ value: Prioridad; label: string }[]>([]);
  categoriaSeleccionada = signal<CategoriaModel | null>(null);

  // Inicializar el FormControl en la declaración
  etiquetaSearchControl = new FormControl('');

  // Formulario reactivo
  ticketForm!: FormGroup;

  // Fechas calculadas
  fechaLimiteRespuesta: Date | null = null;
  fechaLimiteResolucion: Date | null = null;

  // Método constructor con inyección de dependencias
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private etiquetaService: EtiquetaService,
    private categoriaService: CategoriaService,
    private usuarioService: UsuarioService,

    // Importar servicio de notificaciones
    private noti: NotificationService
  ) { }

  /**
   * Ciclo de vida OnInit: inicializa el formulario, carga listas y verifica si es actualización
   */
  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
    this.setupEtiquetaSearch();
    this.debugFormulario();

    // Suscripción a parámetros de ruta para determinar si es crear o actualizar
    this.route.params.subscribe((params) => {
      this.idTicket = params['id'] ?? null
      this.isCreate = this.idTicket === null
      this.titleForm = this.isCreate ? 'Crear' : 'Actualizar'

      //Si hay id se obtiene el ticket a actualizar
      if (this.idTicket) {
        this.ticketService.getById(this.idTicket).subscribe((data) => this.patchFormValues(data))
      }
    })
  }

  /**
   * Inicializar el formulario reactivo con validaciones
   */
  private initForm(): void {

    this.etiquetaSearchControl = this.fb.control(''); // Inicializar control de búsqueda
    this.ticketForm = this.fb.group({
      id: [null],
      codigo: [{ value: '', disabled: true }], // El código se genera con formato INC-2025-"id" a través de generateCodigoTicket()
      titulo: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      descripcion: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      prioridad: [Prioridad.MEDIA, Validators.required], // Valor por defecto Media (si no se selecciona)
      etiquetaId: [null, Validators.required],
      categoriaId: [{ value: null, disabled: true }], // Se establece automáticamente al seleccionar la etiqueta
      solicitanteId: [{ value: this.USUARIO_SOLICITANTE_ID, disabled: true }], // Se usa la variable de prueba para "hardcodear" el id del solicitante
      estado: [{ value: EstadoTicket.PENDIENTE, disabled: true }], // Se envía de forma hardcodeada PENDIENTE como estado
      fechaCreacion: [{ value: this.formatDateTime(new Date()), disabled: true }], // La fecha de creación se formatea en horario de CR

      // Campos informativos (solo para mostrar)
      solicitanteNombre: [{ value: '', disabled: true }],
      solicitanteCorreo: [{ value: '', disabled: true }],
      categoriaNombre: [{ value: '', disabled: true }],
      slaRespuesta: [{ value: '', disabled: true }],
      slaResolucion: [{ value: '', disabled: true }]
    });
  }

  /**
   * Cargar los datos iniciales necesarios para el formulario
   * A través de una promesa
   */
  private async loadInitialData(): Promise<void> {
    try {
      // Cargar usuario solicitante
      await this.loadUsuarioSolicitante();

      // Cargar etiquetas (subscribirse siempre que no se destruya)
      this.etiquetaService.get().pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          this.etiquetasList.set(data);
          this.etiquetasFiltered.set(data);
        });

      // Cargar prioridades
      this.loadPrioridades();

    } catch (error) {
      console.error('[FRONTEND] Error cargando datos iniciales:', error);
      this.noti.error('Error', 'No se pudieron cargar los datos iniciales', 5000);
    }
  }

  /**
   * Cargar la información del usuario solicitante
   */
  private async loadUsuarioSolicitante(): Promise<void> {

    // A través del servicio de usuario, obtener los datos del usuario solicitante
    this.usuarioService.getById(this.USUARIO_SOLICITANTE_ID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuario) => {
          this.usuarioSolicitante = usuario;
          // Actualizar campos informativos
          this.ticketForm.patchValue({
            solicitanteNombre: usuario.nombreCompleto,
            solicitanteCorreo: usuario.correo
          });
        },
        error: (error) => {
          console.error('[FRONTEND] Error cargando usuario solicitante:', error);
          this.noti.error('Error', 'No se pudo cargar la información del usuario', 5000);
        }
      });
  }

  /**
   * Cargar las prioridades disponibles
   */
  private loadPrioridades(): void {

    // Crear un array con las prioridades y asignarles sus etiquetas
    const prioridades = [
      { value: Prioridad.BAJA, label: 'Baja' },
      { value: Prioridad.MEDIA, label: 'Media' },
      { value: Prioridad.ALTA, label: 'Alta' },
      { value: Prioridad.URGENTE, label: 'Urgente' }
    ];
    this.prioridadesList.set(prioridades);
  }

  /**
   * Configurar la búsqueda filtrable de etiquetas
   */
  private setupEtiquetaSearch(): void {

    // Suscribirse a los cambios del control de búsqueda
    this.etiquetaSearchControl.valueChanges.pipe(
      startWith(''), // Iniciar con cadena vacía para cargar todas las etiquetas al inicio
      debounceTime(300), // Esperar 300ms después del último cambio
      distinctUntilChanged(), // Solo continuar si el valor ha cambiado
      takeUntil(this.destroy$) // Desuscribirse al destruir el componente
    ).subscribe(searchTerm => { // Llamar al método de filtrado
      this.filterEtiquetas(searchTerm || '');
    });
  }

  /**
   * Filtrar las etiquetas según el término de búsqueda
   * @param searchTerm Término de búsqueda ingresado por el usuario
   */
  private filterEtiquetas(searchTerm: string): void {

    // Filtrar las etiquetas según el término de búsqueda
    const filtered = this.etiquetasList().filter(etiqueta =>
      etiqueta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) // Comparación sin distinción de mayúsculas/minúsculas
    );

    // Actualizar la lista de etiquetas filtradas
    this.etiquetasFiltered.set(filtered);
  }

  /**
 * Manejar la selección de una etiqueta y carga su categoría asociada
 */
  onEtiquetaSelected(etiquetaId: number): void {

    // Si no hay etiqueta seleccionada, limpiar la categoría
    if (!etiquetaId) {
      this.categoriaSeleccionada.set(null); // Limpiar categoría seleccionada
      this.ticketForm.patchValue({ // Limpiar campos relacionados
        categoriaId: null,
        categoriaNombre: '',
        slaRespuesta: '',
        slaResolucion: ''
      });
      return;
    }

    // Buscar la categoría asociada a esta etiqueta
    this.etiquetaService.getCategoriaByEtiquetaId(etiquetaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categoria) => { // Si se encuentra la categoría en la consulta al servicio
          this.categoriaSeleccionada.set(categoria); // Asignar categoría seleccionada
          console.log("[FRONTEND] Valor de categoriaSeleccionada: ", categoria);
          // Actualizar campos relacionados en el formulario
          this.ticketForm.patchValue({
            categoriaId: categoria.id,
            categoriaNombre: categoria.nombre
          });

          // Calcular de forma dinámica los SLAS de la categoría seleccionada por etiqueta (los tiempos de SLA vienen de categoría)
          this.calculateSLAs(categoria);
        },
        error: (error) => {
          console.error('[FRONTEND]Error cargando categoría:', error);
          this.noti.error('Error', 'No se pudo cargar la categoría asociada', 3000);
        }
      });
  }

  /**
   * Calcular los SLAs basados en la categoría seleccionada
   */
  private calculateSLAs(categoria: CategoriaModel): void {

    // Asignar a fechaCreacion la fecha actual
    const fechaCreacion = new Date();

    // Calcular fecha límite de respuesta
    this.fechaLimiteRespuesta = new Date(fechaCreacion.getTime() + (categoria.sla.maxMinutosRespuesta * 60000));

    // Calcular fecha límite de resolución
    this.fechaLimiteResolucion = new Date(fechaCreacion.getTime() + (categoria.sla.maxMinutosResolucion * 60000));

    // Actualizar campos informativos
    this.ticketForm.patchValue({
      slaRespuesta: this.formatDateTime(this.fechaLimiteRespuesta),
      slaResolucion: this.formatDateTime(this.fechaLimiteResolucion)
    });
  }

  /**
   * Formatear una fecha (hora de Costa Rica)para mostrarla en el formulario
   */
  private formatDateTime(date: Date): string {
    return date.toLocaleString('es-CR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Generar código temporal para el ticket (se actualizará en el backend)
   * @returns Código en formato INC-YYYY-TEMP
   */
  private generateCodigoTicket(): string {
    const currentYear = new Date().getFullYear();
    return `INC-${currentYear}-`;
  }

  /**
   * Obtener el color CSS para la prioridad seleccionada
   */
  getPrioridadColor(prioridad: Prioridad): string {
    switch (prioridad) {
      case Prioridad.BAJA: return 'var(--mat-sys-primary)';
      case Prioridad.MEDIA: return '#ff9800';
      case Prioridad.ALTA: return '#f44336';
      case Prioridad.URGENTE: return '#d32f2f';
      default: return 'var(--mat-sys-outline)';
    }
  }

  /**
   * Obtener el icono para la prioridad seleccionada
   */
  getPrioridadIcon(prioridad: Prioridad): string {
    switch (prioridad) {
      case Prioridad.BAJA: return 'keyboard_arrow_down';
      case Prioridad.MEDIA: return 'remove';
      case Prioridad.ALTA: return 'keyboard_arrow_up';
      case Prioridad.URGENTE: return 'priority_high';
      default: return 'help';
    }
  }

  /**
   * Cargar los valores del formulario para edición
   */
  private patchFormValues(data: TicketModel): void {
    this.ticketForm.patchValue({
      id: data.id,
      codigo: data.codigo,
      titulo: data.titulo,
      descripcion: data.descripcion,
      prioridad: data.prioridad,
      etiquetaId: data.categoria?.etiquetas?.[0]?.id || null,
      categoriaId: data.categoriaId,
      solicitanteId: data.solicitanteId,
      estado: data.estado,
      fechaCreacion: data.creadoAt,
      solicitanteNombre: data.solicitante?.nombreCompleto || '',
      solicitanteCorreo: data.solicitante?.correo || '',
      categoriaNombre: data.categoria?.nombre || '',
    });

    if (data.categoria) {
      this.categoriaSeleccionada.set(data.categoria);
      this.ticketForm.patchValue({
        slaRespuesta: this.formatDateTime(new Date(data.fechaLimiteRespuesta)),
        slaResolucion: this.formatDateTime(new Date(data.fechaLimiteResolucion))
      });
    }

    this.debugFormulario();
  }

  /**
   * Enviar el formulario para crear el ticket
   */
  submitTicket(): void {
    this.debugFormulario(); // LLAMADA A LA FUNCIÓN DE DEBUG

    // Marcar todos los campos del formulario como "tocados" para activar validaciones
    this.ticketForm.markAllAsTouched();

    // Si el formulario es inválido, mostrar notificación de error y salir
    if (this.ticketForm.invalid) {
      this.noti.error('Formulario Inválido', 'Revise los campos marcados.', 3000);
      return;
    }

    // Si no hay categoría seleccionada, mostrar notificación de error y salir
    if (!this.categoriaSeleccionada()) {
      this.noti.error('Categoría requerida', 'Debe seleccionar una etiqueta para determinar la categoría.', 3000);
      return;
    }

    const formValue = this.ticketForm.getRawValue();

    const payload = {

      // Copiar todos los valores del formulario y además asignar categoriaId, usuarioAsignadoId,
      // respondidoAt, resueltoAt, cerradoPorId, cumplioResolucion
      ...formValue,
    codigo: formValue.codigo, // El código se genera en el backend (formato INC-YYYY-<id>)
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      prioridad: formValue.prioridad,
      solicitanteId: this.USUARIO_SOLICITANTE_ID,
      categoriaId: this.categoriaSeleccionada()!.id,
      usuarioAsignadoId: null,
      fechaLimiteRespuesta: this.fechaLimiteRespuesta!.toISOString(),
      fechaLimiteResolucion: this.fechaLimiteResolucion!.toISOString(),
      respondidoAt: null,
      resueltoAt: null,
      cerradoAt: null,
      cerradoPorId: null,
      cumplioRespuesta: null,
      cumplioResolucion: null,

    };

    console.log('[FRONTEND] Payload enviado al API:', payload); // MOSTRAR EL PAYLOAD EN CONSOLA

      // Llamar al servicio correspondiente según si es creación o actualización
      const request$ = this.isCreate
        ? this.ticketService.create(payload)
        : this.ticketService.update(payload);

      // Suscribirse a la respuesta del API y mostrar notificación de éxito
      request$.pipe(takeUntil(this.destroy$)).subscribe(data => {
        this.noti.success(
          this.isCreate ? 'CREACIÓN' : 'ACTUALIZACIÓN',
          `Ticket ${data.codigo} ${this.isCreate ? 'creado' : 'actualizado'}`,
          2000,
          '/ticket'
        );
      });
  }

  /**
   * Resetear el formulario a valores iniciales
   */
  onReset(): void {
    this.ticketForm.reset({
      prioridad: Prioridad.MEDIA,
      solicitanteId: this.USUARIO_SOLICITANTE_ID,
      estado: EstadoTicket.PENDIENTE,
      fechaCreacion: new Date()
    });

    this.categoriaSeleccionada.set(null);
    this.fechaLimiteRespuesta = null;
    this.fechaLimiteResolucion = null;
    this.etiquetaSearchControl.setValue('');

    // Recargar información del solicitante
    this.loadUsuarioSolicitante();
  }

  /**
   * Navegar de regreso a la lista de tickets
   */
  goBack(): void {
    this.router.navigate(['/ticket']);
  }

  /**
   * Ciclo de vida OnDestroy: limpia suscripciones
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Función utilitaria para debuggear el formulario
   */
  private debugFormulario(): void {
    console.log('====== DEBUG DEL FORMULARIO TICKET =======');
    console.log('Formulario:', this.ticketForm);
    console.log('Estado del formulario:', this.ticketForm.status);
    console.log('Valores del formulario:', this.ticketForm.value);
    console.log('Valores raw:', this.ticketForm.getRawValue());
    console.log('Errores generales:', this.ticketForm.errors);
    console.log('Usuario solicitante:', this.usuarioSolicitante);
    console.log('Categoría seleccionada:', this.categoriaSeleccionada());
    console.log('SLA Respuesta:', this.fechaLimiteRespuesta);
    console.log('SLA Resolución:', this.fechaLimiteResolucion);
    console.log('====== FIN DEBUG TICKET ======\n');
  }

}
