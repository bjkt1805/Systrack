import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, takeUntil, filter } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { EspecialidadModel } from '../../share/models/EspecialidadModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EspecialidadService } from '../../share/services/api/especialidad.service';
import { FileUploadService } from '../../share/services/api/file-upload.service';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { EtiquetaService } from '../../share/services/api/etiqueta.service';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { EtiquetaModel } from '../../share/models/EtiquetaModel';
import { SLAService } from '../../share/services/api/sla.service';
import { SLAModel } from '../../share/models/SLAModel';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-categoria-form',
  standalone: false,
  templateUrl: './categoria-form.html',
  styleUrl: './categoria-form.css',
})
export class CategoriaForm implements OnInit, OnDestroy {
  // Subject para controlar la destrucción de suscripciones y evitar memory leaks
  private destroy$ = new Subject<void>();

  // Título del formulario, id de la categoría y bandera de creación/actualización
  titleForm = '';
  idCategoria: number | null = null;
  isCreate = true;

  // Listas de especialidades con signals
  especialidadesList = signal<EspecialidadModel[]>([]);

  // Listas de etiquetas con signals
  etiquetasList = signal<EtiquetaModel[]>([]);

  //Lista de SLAs con signals
  slaList = signal<SLAModel[]>([]);

  // Formulario reactivo
  categoriaForm!: FormGroup;

  // Método constructor con inyección de dependencias
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private categoriaService: CategoriaService,
    private especialidadService: EspecialidadService,
    private etiquetaService: EtiquetaService,
    private slaService: SLAService,
    private uploadService: FileUploadService,

    // Importar servicio de notificaciones
    private noti: NotificationService,
    private translate: TranslateService
  ) {}

  /**
   * Ciclo de vida OnInit: inicializa el formulario, carga listas y verifica si es actualización
   */
  ngOnInit(): void {
    this.initForm(); // Inicializa formulario reactivo
    this.debugFormulario(); // Función de debug del formulario
    this.loadEspecialidades(); // Carga lista de especialidades
    this.loadEtiquetas(); // Carga lista de etiquetas
    this.loadSLAs(); // Carga SLAs

    // Suscripción a parámetros de ruta para determinar si es crear o actualizar
    this.route.params.subscribe((params) => {
      this.idCategoria = params['id'] ?? null;
      this.isCreate = this.idCategoria === null;
      const tituloKey = this.isCreate 
        ? 'CATEGORIA_NOTIFICACIONES.CREAR_TITULO' 
        : 'CATEGORIA_NOTIFICACIONES.ACTUALIZAR_TITULO';
      
      this.translate.get(tituloKey).subscribe(titulo => {
        this.titleForm = titulo;
      });

      //Si hay id se obtiene la categoría a actualizar
      if (this.idCategoria) {
        this.categoriaService
          .getById(this.idCategoria)
          .subscribe((data) => this.patchFormValues(data));
      }
    });
  }

  /**
   * Inicializar el formulario reactivo con validaciones
   */
  private initForm(): void {
    this.categoriaForm = this.fb.group({
      id: [null],
      nombre: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(25)]], // Nombre de usuario requerido, mínimo 5 caracteres y máximo 25
      descripcion: [
        null,
        [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
      ], // Nombre completo requerido, mínimo 3 caracteres y máximo 200
      especialidades: this.fb.array([], [Validators.required]), // FormArray para especialidades con validación requerida
      etiquetas: this.fb.array([], [Validators.required]), // FormArray para etiquetas con validación requerida
      sla: [null, [Validators.required]],
    });
  }

  /**
   * Getter para acceder al FormArray de especialidades
   */
  get especialidades(): FormArray {
    return this.categoriaForm.get('especialidades') as FormArray;
  }

  /**
   * Getter para acceder al FormArray de etiquetas
   */
  get etiquetas(): FormArray {
    return this.categoriaForm.get('etiquetas') as FormArray;
  }

  /**
   * Carga las especialidades desde el API y actualiza la signal
   */
  private loadEspecialidades() {
    this.especialidadService
      .get()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => this.especialidadesList.set(data));
  }

  /**
   * Carga las etiquetas desde el API y actualiza la signal
   */
  private loadEtiquetas() {
    this.etiquetaService
      .get()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => this.etiquetasList.set(data));
  }

  /**
   * Carga los SLAs desde el API y actualiza la signal
   */
  private loadSLAs() {
    this.slaService
      .get()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        console.log('SLAs cargados:', data); // Para ver si se están cargando correctamente
        this.slaList.set(data);
      });
  }

  /**
   * Carga los valores del formulario con los datos de la categoría a actualizar
   * @param data Datos de la categoría obtenidos del API
   */
  private patchFormValues(data: CategoriaModel) {
    //setValue de los campos del formulario
    this.categoriaForm.patchValue({
      id: data.id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      sla: data.sla?.id || null,
    });

    // Limpia y agrega especialidades al FormArray de especialidades
    this.especialidades.clear();
    if (data.especialidades?.length) {
      data.especialidades.forEach((esp) => {
        this.especialidades.push(
          this.fb.group({
            especialidadId: [esp.id, Validators.required],
          })
        );
      });
    } else {
      // Si no hay especialidades, agregar una vacía
      this.addEspecialidad();
    }

    // Limpia y agrega etiquetas al FormArray de etiquetas
    this.etiquetas.clear();
    if (data.etiquetas?.length) {
      data.etiquetas.forEach((etiq) => {
        this.etiquetas.push(
          this.fb.group({
            etiquetaId: [etiq.id, Validators.required],
          })
        );
      });
    } else {
      // Si no hay etiquetas, agregar una vacía
      this.addEtiqueta();
    }

    this.debugFormulario(); // LLAMADA A LA FUNCIÓN DE DEBUG
  }

  /**
   * Agrega un nuevo grupo de especialidad al FormArray
   */
  addEspecialidad() {
    this.especialidades.push(
      this.fb.group({
        especialidadId: [null, Validators.required],
      })
    );
  }

  /**
   * Agrega un nuevo grupo de etiqueta al FormArray
   */
  addEtiqueta() {
    this.etiquetas.push(
      this.fb.group({
        etiquetaId: [null, Validators.required],
      })
    );
  }

  /**
   * Elimina una especialidad del FormArray según el índice
   * @param index Índice de la especialidad a eliminar
   */
  removeEspecialidad(index: number) {
    // VALIDACIÓN: En modo edición, permitir eliminar hasta quedar sin especialidades
    // En modo creación, mantener al menos una
    if (this.isCreate && this.especialidades.length <= 1) {
      this.translate.get([
        'CATEGORIA_NOTIFICACIONES.ESPECIALIDAD_REQUERIDA_TITULO',
        'CATEGORIA_NOTIFICACIONES.ESPECIALIDAD_REQUERIDA_MENSAJE'
      ]).subscribe(translations => {
        this.noti.warning(
          translations['CATEGORIA_NOTIFICACIONES.ESPECIALIDAD_REQUERIDA_TITULO'],
          translations['CATEGORIA_NOTIFICACIONES.ESPECIALIDAD_REQUERIDA_MENSAJE'],
          3000
        );
      });
      return;
    }

    // Eliminar la especialidad
    this.especialidades.removeAt(index);

    // Actualizar el control del formulario
    this.categoriaForm.setControl('especialidades', this.fb.array(this.especialidades.controls));

    console.log(`🗑️ Especialidad ${index} eliminada. Quedan: ${this.especialidades.length}`);

    // AGREGAR especialidad vacía si no quedan y estamos creando
    if (this.isCreate && this.especialidades.length === 0) {
      this.addEspecialidad();
    }
  }

  /**
   * Elimina una especialidad del FormArray según el índice
   * @param index Índice de la especialidad a eliminar
   */
  removeEtiqueta(index: number) {
    // VALIDACIÓN: En modo edición, permitir eliminar hasta quedar sin etiquetas
    // En modo creación, mantener al menos una
    if (this.isCreate && this.etiquetas.length <= 1) {
      this.translate.get([
        'CATEGORIA.NOTIFICACIONES.ETIQUETA_REQUERIDA_TITULO',
        'CATEGORIA.NOTIFICACIONES.ETIQUETA_REQUERIDA_MENSAJE'
      ]).subscribe(translations => {
        this.noti.warning(
          translations['CATEGORIA.NOTIFICACIONES.ETIQUETA_REQUERIDA_TITULO'],
          translations['CATEGORIA.NOTIFICACIONES.ETIQUETA_REQUERIDA_MENSAJE'],
          3000
        );
      });
      return;
    }

    // Eliminar la etiqueta
    this.etiquetas.removeAt(index);

    // Actualizar el control del formulario
    this.categoriaForm.setControl('etiquetas', this.fb.array(this.etiquetas.controls));

    console.log(`🗑️ Etiqueta ${index} eliminada. Quedan: ${this.etiquetas.length}`);

    // AGREGAR etiqueta vacía si no quedan y estamos creando
    if (this.isCreate && this.etiquetas.length === 0) {
      this.addEtiqueta();
    }
  }

  /**
   * Obtiene las especialidades disponibles para un índice específico
   * @param currentIndex Índice actual del select de especialidades
   * @returns Array de especialidades no seleccionadas o la especialidad actual
   */
  getEspecialidadesDisponibles(currentIndex: number): EspecialidadModel[] {
    // Obtener todas las especialidades seleccionadas actualmente
    const especialidadesSeleccionadas = this.especialidades.value
      .map((esp: any, index: number) => {
        // Excluir el índice actual para permitir que mantenga su selección
        return index !== currentIndex ? esp.especialidadId : null;
      })
      .filter((id: any) => id !== null && id !== undefined);

    console.log(
      `Especialidades ya seleccionadas (excluyendo índice ${currentIndex}):`,
      especialidadesSeleccionadas
    );

    // Filtrar especialidades disponibles
    const disponibles = this.especialidadesList().filter((especialidad) => {
      const yaSeleccionada = especialidadesSeleccionadas.includes(especialidad.id);
      return !yaSeleccionada;
    });

    console.log(
      `Especialidades disponibles para índice ${currentIndex}:`,
      disponibles.map((e) => e.nombre)
    );

    return disponibles;
  }

  /**
   * Verifica si una especialidad ya está seleccionada en otro select
   * @param especialidadId ID de la especialidad a verificar
   * @param currentIndex Índice actual del select
   * @returns true si ya está seleccionada, false si está disponible
   */
  isEspecialidadSeleccionada(especialidadId: number, currentIndex: number): boolean {
    return this.especialidades.value.some(
      (esp: any, index: number) => index !== currentIndex && esp.especialidadId === especialidadId
    );
  }

  /**
   * Obtiene las especialidades disponibles para un índice específico
   * @param currentIndex Índice actual del select de especialidades
   * @returns Array de especialidades no seleccionadas o la especialidad actual
   */
  getEtiquetasDisponibles(currentIndex: number): EtiquetaModel[] {
    // Obtener todas las etiquetas seleccionadas actualmente
    const etiquetasSeleccionadas = this.etiquetas.value
      .map((etq: any, index: number) => {
        // Excluir el índice actual para permitir que mantenga su selección
        return index !== currentIndex ? etq.etiquetaId : null;
      })
      .filter((id: any) => id !== null && id !== undefined);

    console.log(
      `Etiquetas ya seleccionadas (excluyendo índice ${currentIndex}):`,
      etiquetasSeleccionadas
    );

    // Filtrar etiquetas disponibles
    const disponibles = this.etiquetasList().filter((etiqueta) => {
      const yaSeleccionada = etiquetasSeleccionadas.includes(etiqueta.id);
      return !yaSeleccionada;
    });

    console.log(
      `Etiquetas disponibles para índice ${currentIndex}:`,
      disponibles.map((e) => e.nombre)
    );

    return disponibles;
  }

  /**
   * Verifica si una especialidad ya está seleccionada en otro select
   * @param especialidadId ID de la especialidad a verificar
   * @param currentIndex Índice actual del select
   * @returns true si ya está seleccionada, false si está disponible
   */
  isEtiquetaSeleccionada(etiquetaId: number, currentIndex: number): boolean {
    return this.etiquetas.value.some(
      (etq: any, index: number) => index !== currentIndex && etq.etiquetaId === etiquetaId
    );
  }

  /**
   * Envía el formulario: valida, guarda/actualiza la categoría
   */
  submitCategoria() {
    this.debugFormulario(); // LLAMADA A LA FUNCIÓN DE DEBUG

    // Marcar todos los campos del formulario como "tocados" para activar validaciones
    this.categoriaForm.markAllAsTouched();

    // Marcar cada control dentro del FormArray 'especialidades' como "tocado"
    this.especialidades.controls.forEach((group) => group.markAllAsTouched());

    // Marcar cada control dentro del FormArray 'etiquetas' como "tocado"
    this.etiquetas.controls.forEach((group) => group.markAllAsTouched());

    // Si el formulario es inválido, mostrar notificación de error y salir
    if (this.categoriaForm.invalid) {
      this.translate.get([
        'CATEGORIA_NOTIFICACIONES.FORMULARIO_INVALIDO_TITULO',
        'CATEGORIA_NOTIFICACIONES.FORMULARIO_INVALIDO_MENSAJE'
      ]).subscribe(translations => {
        this.noti.error(
          translations['CATEGORIA_NOTIFICACIONES.FORMULARIO_INVALIDO_TITULO'],
          translations['CATEGORIA_NOTIFICACIONES.FORMULARIO_INVALIDO_MENSAJE'],
          5000
        );
      });
      return;
    }

    // Prepara payloads para el API
    const formValue = this.categoriaForm.value;
    console.log('Datos a enviar al API:', formValue); // MOSTRAR LOS VALORES DEL FORMULARIO EN CONSOLA

    // Preparar payload de especialidades
    const especialidadesIds = this.especialidades.value
      .map((esp: any) => esp.especialidadId)
      .filter((id: any) => id !== null && id !== undefined);

    // Preparar payload completo
    const payload = {
      // Copiar todos los valores del formulario y además asignar especialidades e imagen
      ...formValue,
      // Enviar especialidades como objetos con id
      especialidades: especialidadesIds.map((id: number) => ({ id })),
      // Enviar etiquetas como objetos con id
      etiquetas: this.etiquetas.value.map((etq: any) => ({ id: etq.etiquetaId })),
      // Enviar SLA como objeto con id
      sla: { id: formValue.sla },
    };

    console.log('Payload enviado al API:', payload); // MOSTRAR EL PAYLOAD EN CONSOLA

    // Llamar al servicio correspondiente según si es creación o actualización
    const request$ = this.isCreate
      ? this.categoriaService.create(payload)
      : this.categoriaService.update(payload);

    // Suscribirse a la respuesta del API y mostrar notificación de éxito
    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        const tituloKey = this.isCreate 
          ? 'CATEGORIA_NOTIFICACIONES.CREAR_TITULO' 
          : 'CATEGORIA_NOTIFICACIONES.EDITAR_TITULO';
        
        const mensajeKey = this.isCreate 
          ? 'CATEGORIA_NOTIFICACIONES.CREAR_MENSAJE' 
          : 'CATEGORIA_NOTIFICACIONES.ACTUALIZAR_MENSAJE';

        this.translate.get([tituloKey, mensajeKey], { nombre: data.nombre }).subscribe(translations => {
          this.noti.success(
            translations[tituloKey],
            translations[mensajeKey],
            5000,
            '/categoria'
          );
        });
      },
      error: (error) => {
        console.error('Error al procesar categoría:', error);
        this.translate.get([
          'CATEGORIA_NOTIFICACIONES.ERROR_TITULO',
          'CATEGORIA_NOTIFICACIONES.ERROR_MENSAJE'
        ]).subscribe(translations => {
          this.noti.error(
            translations['CATEGORIA_NOTIFICACIONES.ERROR_TITULO'],
            translations['CATEGORIA_NOTIFICACIONES.ERROR_MENSAJE'],
            5000
          );
        });
      }
    });
  }

  /**
   * Resetea el formulario a valores iniciales
   */
  onReset() {
    this.categoriaForm.reset({
      nombre: '',
      descripcion: '',
    });
    this.especialidades.clear();
    this.addEspecialidad();
    this.etiquetas.clear();
    this.addEtiqueta();
  }

  /**
   * Navega de regreso a la lista de categorías
   */
  goBack() {
    this.router.navigate(['/categoria']);
  }

  /**
   * Ciclo de vida OnDestroy: limpia suscripciones
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Función utilitaria para debuggear el formulario
   */
  private debugFormulario() {
    console.log('====== DEBUG DEL FORMULARIO =======');
    console.log('Formulario:', this.categoriaForm);
    console.log('Estado del formulario:', this.categoriaForm.status);
    console.log('Valores del formulario:', this.categoriaForm.value);
    console.log('Errores generales del formulario:', this.categoriaForm.errors);

    console.log('====== CAMPOS INDIVIDUALES DEL FORMULARIO ======');

    // Iterar sobre cada control del formulario y mostrar su estado
    Object.keys(this.categoriaForm.controls).forEach((key) => {
      // Obtener el control por su clave
      const control = this.categoriaForm.get(key);

      // Si el control existe, mostrar su estado
      if (control) {
        console.log(`CAMPO ${key}: ${control.valid ? 'VÁLIDO' : 'INVÁLIDO'} `, {
          valor: control.value,
          tocado: control.touched,
          errores: control.errors,
        });
      }
    });

    // Mostrar estado del FormArray de especialidades
    console.log('====== ESPECIALIDADES ======');
    console.log('¿Es el array de especialidades válido?:', this.especialidades.valid);
    console.log('Errores del array de especialidades:', this.especialidades.errors);
    console.log('Cantidad de especialidades en el array:', this.especialidades.length);

    // Iterar sobre cada especialidad en el FormArray y mostrar su estado
    this.especialidades.controls.forEach((control, index) => {
      console.log(
        `ESPECIALIDAD ${index}: ${control.valid ? 'ESPECIALIDAD VÁLIDA' : 'ESPECIALIDAD INVÁLIDA'}`,
        {
          valor: control.value,
          válido: control.valid,
          errores: control.errors,
          tocado: control.touched,
        }
      );
    });

    // Mostrar estado del FormArray de etiquetas
    console.log('====== ETIQUETAS ======');
    console.log('¿Es el array de etiquetas válido?:', this.etiquetas.valid);
    console.log('Errores del array de etiquetas:', this.etiquetas.errors);
    console.log('Cantidad de etiquetas en el array:', this.etiquetas.length);

    // Iterar sobre cada etiqueta en el FormArray y mostrar su estado
    this.etiquetas.controls.forEach((control, index) => {
      console.log(`ETIQUETA ${index}: ${control.valid ? 'ETIQUETA VÁLIDA' : 'ETIQUETA INVÁLIDA'}`, {
        valor: control.value,
        válido: control.valid,
        errores: control.errors,
        tocado: control.touched,
      });
    });

    console.log('====== FIN DEL DEBUG DEL FORMULARIO ======\n');
  }
}
