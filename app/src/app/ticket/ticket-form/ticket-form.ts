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
import { ImagenTicketModel } from '../../share/models/ImagenTicketModel';

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

  // Gestión de imágenes del tiquete (historial)
  selectedImages: File[] = []; // Array de imágenes inicializado vacio 
  imagePreviews: string[] = []; // Array de vistas previas inicializado vacío (guarda los urls de las imágenes)
  existingImages: ImagenTicketModel[] = []; // Array de imágenes que están asociadas al tiquete (vista editar)
  imagesToDelete: number[] = []; // Array de IDs de imágenes marcadas para eliminar de imagenTicket
  maxImages = 5; // Cantidad máxima de imágenes a subir 

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
      this.isCreate = this.idTicket === null // Si no hay id del tiquete, es creación
      this.titleForm = this.isCreate ? 'Crear' : 'Actualizar'

      //Si hay id se obtiene el ticket a actualizar
      if (this.idTicket) {

        // Cargar datos del ticket para edición y subscribirse a la respuesta para cargar el formulario con 
        // los datos del tiquete
        this.ticketService.getById(this.idTicket).subscribe((data) => this.patchFormValues(data))
      }
    })
  }

  /**
   * Inicializar el formulario reactivo con validaciones
   * @returns void
   */
  private initForm(): void {

    this.etiquetaSearchControl = this.fb.control(''); // Inicializar control de búsqueda
    this.ticketForm = this.fb.group({
      id: [null],
      codigo: [{ value: '', disabled: true }], // El código se genera con formato INC-2025-"id" a través de generateCodigoTicket()
      titulo: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(20)]], // Título obligatorio (5-20 caracteres)
      descripcion: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(500)]], // Descripción obligatoria (10-500 caracteres)
      prioridad: [Prioridad.MEDIA, Validators.required], // Valor por defecto Media (si no se selecciona)
      etiquetaId: [null, Validators.required], // Etiqueta obligatoria para determinar la categoría
      categoriaId: [{ value: null, disabled: true }], // Se establece automáticamente al seleccionar la etiqueta. Deshabilitado por defecto. 
      solicitanteId: [{ value: this.USUARIO_SOLICITANTE_ID, disabled: true }], // Se usa la variable de prueba para "hardcodear" el id del solicitante. Deshabilitado por defecto. 
      estado: [{ value: EstadoTicket.PENDIENTE, disabled: true }], // Se envía de forma hardcodeada PENDIENTE como estado. Deshabilitado por defecto.
      fechaCreacion: [{ value: this.formatDateTime(new Date()), disabled: true }], // La fecha de creación se formatea en horario de CR. Deshabilitado por defecto. 

      // Campos informativos (solo para mostrar en el formulario) y deshabilitados por defecto. 
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

      // Cargar etiquetas (subscribirse hasta que se destruya)
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
          // del solicitante en el formulario
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
      this.ticketForm.patchValue({ // Limpiar campos relacionados a la categoría 
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
   * Función para manejar la selección de múltiples imágenes 
   */
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement; // Obtener el elemento input del evento (en la plantilla)

    // Revisar que haya archivos y que la longitud del arreglo de archivos sea mayor a 0 
    if (input.files && input.files.length > 0) {

      // Verificar el límite de imágenes (5)

      if (this.selectedImages.length + input.files.length > this.maxImages) {

        // Enviar error y salir de la función
        this.noti.error('Límite de imágenes', `No puede seleccionar más de ${this.maxImages} imágenes.`, 3000);
        return;
      }

      // Procesar los archivos seleccionados (usando input files como fuente del arreglo)
      Array.from(input.files).forEach(file => {

        // Validar primero el tipo de archivo 
        if (!file.type.startsWith('image/')) {
          this.noti.error('Tipo de archivo inválido', 'Solo se permiten archivos de imagen.', 3000);
          return;
        }

        // Validar el tamaño del archivo (2 MB máximo)
        if (file.size > 2 * 1024 * 1024) {
          this.noti.error('Archivo demasiado grande', 'Tamaño máximo del archivo: 2 MB.', 3000);
          return;
        }

        // Agregar el archivo al array de archivos 
        this.selectedImages.push(file);

        // Generar la vista previa del archivo
        this.generatePreview(file);
      });
    }

  }

  /** 
   * Generar la vista previa de la imagen 
   * */
  private generatePreview(file: File): void {
    const reader = new FileReader(); // instancias un objeto FileReader

    // Configurar el evento onload 
    reader.onload = (e) => {
      if (e.target?.result) {
        this.imagePreviews.push(e.target.result as string); // Agregar la vista previa al array
      }
    };
    reader.readAsDataURL(file); // Leer el archivo como URL de datos

  }

  /**
   * Eliminar una imagen seleccionada junto con su imagen previa
   * @param index Índice de la imagen a eliminar
   */
  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  /**
   * Obtener el color CSS para la prioridad seleccionada
   * @param prioridad (Tipo Prioridad Enum) 
   * @returns código hexadecimal del color
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
   * @param prioridad (Tipo Prioridad Enum) 
   * @returns nombre del icono de Material Icons
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
   * @param data Datos del ticket a cargar
   */
  private patchFormValues(data: TicketModel): void {
    this.ticketForm.patchValue({
      id: data.id,
      codigo: data.codigo,
      titulo: data.titulo,
      descripcion: data.descripcion,
      prioridad: data.prioridad,
      etiquetaId: data.categoria?.etiquetas?.[0]?.id || null, // Asignar la primera etiqueta (id)de la categoría
      categoriaId: data.categoriaId,
      solicitanteId: data.solicitanteId,
      estado: data.estado,
      fechaCreacion: data.creadoAt,
      solicitanteNombre: data.solicitante?.nombreCompleto || '',
      solicitanteCorreo: data.solicitante?.correo || '',
      categoriaNombre: data.categoria?.nombre || '',
    });

    // Si existe categoría, asignarla y calcular SLAs automáticamente
    if (data.categoria) {
      this.categoriaSeleccionada.set(data.categoria);
      this.ticketForm.patchValue({
        slaRespuesta: this.formatDateTime(new Date(data.fechaLimiteRespuesta)), // Formatear fecha límite de respuesta
        slaResolucion: this.formatDateTime(new Date(data.fechaLimiteResolucion)) // Formatear fecha límite de resolución
      });
    }

    // Cargar las imágenes relacionadas a este tiquete
    this.loadImagesTicket(data);

    this.debugFormulario();
  }

  /** 
   * Cargar las imáges asociadas al tiquete
   * @param data Datos del ticket
   */
  private loadImagesTicket(data: TicketModel): void {

    // Limpiar las imágenes cargadas en el formulario (si hay)
    this.existingImages = [];

    // Revisar que el tiquete tenga historial y que la longitud sea mayor a 0 
    if (data.historiales && data.historiales.length > 0) {

      // Recorrer todos los historiales del tiquete para obtener las imágenes asociadas 
      data.historiales.forEach((historial, index) => {

        // Revisar que el historial tenga imágenes y que la longitud sea mayor a 0
        if (historial.imagenes && historial.imagenes.length > 0) {

          // En este caso agregar las imágenes asociadas a historial al array de existingImages (el que se carga en el formulario)
          historial.imagenes.forEach(imagen => {
            this.existingImages.push({
              id: imagen.id,
              historialId: historial.id,
              url: imagen.url,
              descripcion: imagen.descripcion,
              creadoAt: imagen.creadoAt,
              updatedAt: imagen.updatedAt,
              historial: imagen.historial,
            });
          });
        }
      });
    }
  }

  /** 
   * Obtener la URL completa de la imagen (backend + ruta) 
   * recibiendo como parámetro el nombre del archivo 
   * @param filename 
   */
  getImageUrl(filename: string): string {
    return `http://localhost:3000/images/${filename}`;
  }

  /**
   * Enviar el id de la imagen a borrar del backend (imagenTicket)
   * Este método es para marcar la imagen, no llama al servicio para borrarla todavía
   * @param imageId
   */
  markImageForDeletion(imageId: number): void {
    
    // Revisar que el array imagesToDelete no contenga ya el id de la imagen
    if (!this.imagesToDelete.includes(imageId)) {
      this.imagesToDelete.push(imageId); // Agregar el id de la imagen al array
    }
  }

  /** 
   * Desmarcar una imagen para no borrarla
   * @param imageId 
   */
  unmarkImageForDeletion(imageId: number): void {
    
    // Obtener el índice de la imagen a desmarcar
    const indice = this.imagesToDelete.indexOf(imageId);

    // Si el índice es válido (mayor a -1, ya que 0 también se incluye), eliminarlo del array
    if (indice > -1) {
      this.imagesToDelete.splice(indice, 1);
    }
  }

  /**
   * Método que retorna booleano para verificar si la imagen 
   * está marcada para eliminación
   * @param imageId 
   * @returns true si está marcada, false si no
   */
  isImageMarkedForDeletion(imageId: number): boolean {

    // Devuelve true si la imagen está en el array de imágenes a eliminar
    return this.imagesToDelete.includes(imageId);
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

    //Crear FormData para poder enviar imágenes junto con los datos del ticket
    const formData = new FormData();

    // Creación de un objeto payload con los datos del formulario
    const payload = {

      // Enviar todos los datos del tiquete en el payload 
      codigo: this.ticketForm.get('codigo')?.value, // El código se genera en el backend (formato INC-YYYY-<id>)
      titulo: this.ticketForm.get('titulo')?.value,
      descripcion: this.ticketForm.get('descripcion')?.value,
      prioridad: this.ticketForm.get('prioridad')?.value,
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

    // Convertir los datos del objeto "payload" a JSON
    formData.append('ticketData', JSON.stringify(payload));

    // Agregar el arreglo de las imágenes al formData 
    this.selectedImages.forEach((file) => {
      formData.append('images', file);
    }); 

    console.log('[FRONTEND] Datos del tiquete enviados al API:', formData.get('ticketData')); // MOSTRAR EL PAYLOAD EN CONSOLA
    console.log('[FRONTEND] Imágenes seleccionadas para enviar al API:', this.selectedImages);

    // Agregar el arreglo de IDs de imágenes a eliminar (si hay) al formData
    if (!this.isCreate && this.imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(this.imagesToDelete));

      console.log('[FRONTEND] Imágenes marcadas para eliminar del tiquete:', this.imagesToDelete);
    }

    // Llamar al servicio correspondiente según si es creación o actualización
    const request$ = this.isCreate
      ? this.ticketService.createTiquete(formData)
      : this.ticketService.updateTiquete(this.idTicket!,formData);

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
   * Limpiar las imágenes seleccionadas
   */
  clearImages(): void {
    this.selectedImages = [];
    this.imagePreviews = [];
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
    console.log('Valores sin formato:', this.ticketForm.getRawValue());
    console.log('Errores generales:', this.ticketForm.errors);
    console.log('Usuario solicitante:', this.usuarioSolicitante);
    console.log('Categoría seleccionada:', this.categoriaSeleccionada());
    console.log('SLA Respuesta:', this.fechaLimiteRespuesta);
    console.log('SLA Resolución:', this.fechaLimiteResolucion);
    console.log('====== FIN DEBUG TICKET ======\n');
  }

}
