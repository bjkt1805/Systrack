import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, takeUntil, filter } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { EspecialidadModel } from '../../share/models/EspecialidadModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EspecialidadService } from '../../share/services/api/especialidad.service';
import { FileUploadService } from '../../share/services/api/file-upload.service';
import { TecnicoService } from '../../share/services/api/tecnico.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { EstadoTecnico } from '../../share/models/EnumsModel';
import { passwordsMatchValidator } from '../../share/validators/password-match-validator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tecnico-form',
  standalone: false,
  templateUrl: './tecnico-form.html',
  styleUrl: './tecnico-form.css',
})
export class TecnicoForm implements OnInit, OnDestroy {
  hidePassword = true; // Para mostrar/ocultar la contraseña
  hideConfirmPassword = true; // Para mostrar/ocultar la confirmación de contraseña

  changePassword = false; // Bandera por si el usuario quiere cambiar la contraseña

  // Subject para controlar la destrucción de suscripciones y evitar memory leaks
  private destroy$ = new Subject<void>();

  // Título del formulario, id del técnico y bandera de creación/actualización
  titleForm = 'Crear';
  idTecnico: number | null = null;
  isCreate = true;

  // Listas de especialidades con signals
  especialidadesList = signal<EspecialidadModel[]>([]);

  // Formulario reactivo
  tecnicoForm!: FormGroup;

  // Variables para gestión de imagen
  currentFile?: File;
  preview = '';
  nameImage = 'image-not-found.jpg';
  previousImage: string | null = null;

  // Expresiones regulares para validacion de correo electrónico y teléfono
  phonePattern = /^\+?[1-9]\d{1,14}$/;
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Método constructor con inyección de dependencias
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private tecnicoService: TecnicoService,
    private especialidadService: EspecialidadService,
    private uploadService: FileUploadService,

    // Importar servicio de notificaciones
    private noti: NotificationService,

    // Servicio de traducción
    private translate: TranslateService
  ) {}

  /**
   * Ciclo de vida OnInit: inicializa el formulario, carga listas y verifica si es actualización
   */
  ngOnInit(): void {
    this.initForm(); // Inicializa formulario reactivo
    this.debugFormulario(); // Función de debug del formulario
    this.loadEspecialidades(); // Carga lista de especialidades

    // Suscripción a parámetros de ruta para determinar si es crear o actualizar
    this.route.params.subscribe((params) => {
      this.idTecnico = params['id'] ?? null;
      this.isCreate = this.idTecnico === null;
      this.titleForm = this.isCreate ? 'Crear' : 'Actualizar';

      //Configurar la bandera changePassword según el modo
      this.changePassword = this.isCreate;

      //Si hay id se obtiene el técnico a actualizar
      if (this.idTecnico) {
        this.tecnicoService.getById(this.idTecnico).subscribe((data) => this.patchFormValues(data));
      }
    });
  }

  /**
   * Inicializar el formulario reactivo con validaciones
   */
  private initForm(): void {
    this.tecnicoForm = this.fb.group(
      {
        id: [null],
        nombreUsuario: [
          null,
          [Validators.required, Validators.minLength(5), Validators.maxLength(20)],
        ], // Nombre de usuario requerido, mínimo 5 caracteres y máximo 20
        nombreCompleto: [
          null,
          [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
        ], // Nombre completo requerido, mínimo 3 caracteres y máximo 50
        correo: [null, [Validators.required, Validators.pattern(this.emailPattern)]], // Correo requerido y formato válido (utilizando la expresión regular)
        telefono: [
          null,
          [
            Validators.required,
            Validators.pattern(this.phonePattern),
            Validators.minLength(8),
            Validators.maxLength(8),
          ],
        ], // Teléfono requerido y formato válido (utilizando la expresión regular)
        password: [''], // Campo vacío para determinar si utilizarlo en la vista de creación o edición
        confirmpassword: [''], // Campo vacío para determinar si utilizarlo en la vista de creación o edición
        foto: [this.nameImage],
        rol: ['TECNICO'], // Rol fijo para técnicos
        estadoTecnico: ['DISPONIBLE', Validators.required], // Campo requerido (valor por defecto 'DISPONIBLE')
        cargaTrabajo: [0], // Campo por defecto que viene en 0
        activo: [true, Validators.required], // Campo de estado (valor por defecto true)
        especialidades: this.fb.array([], [Validators.required]), // FormArray para especialidades con validación requerida
      },
      { validators: passwordsMatchValidator }
    ); // Validador personalizado para verificar que las contraseñas coincidan

    // Aplicar los validators a los campos password y confirmpassword dependiendo del modo (creación o Edición)
    this.updatePasswordValidators();
  }

  /**
   * Método para actualizar validators de contraseña según el modo (Creación o Edición)
   */
  private updatePasswordValidators(): void {
    const passwordControl = this.tecnicoForm.get('password'); // Obtener el control de campo password desde el formulario
    const confirmPasswordControl = this.tecnicoForm.get('confirmpassword'); // Obtener el control de campo confirmpassword desde el formulario

    // Si se está en modo de creación O la bandera "changePassword" es true, configurar los validators de los campos
    if (this.isCreate || this.changePassword) {
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      confirmPasswordControl?.setValidators([Validators.required]);
    }

    // Si no es modo creación o la bandera "changePassword" es false, limpiar/quitar los validators de los campos
    else {
      passwordControl?.clearValidators();
      confirmPasswordControl?.clearValidators();
    }

    // Actualizar el estado de validez de los controles después de cambiar los validators
    passwordControl?.updateValueAndValidity();
    confirmPasswordControl?.updateValueAndValidity();
  }

  /**
   * Método para habilitar/deshabilitar cambio de contraseña si el usuario prefiere (en modo edición)
   */
  toggleChangePassword(): void {
    this.changePassword = !this.changePassword; // Alternar el valor de la bandera

    // Si la bandera "changePassword" es true, limpiar los campos "password" y "confirmPassword"

    if (this.changePassword) {
      this.tecnicoForm.patchValue({
        password: '',
        confirmpassword: '',
      });

      // Marcar los campos password y confirmpassword como no tocados
      this.tecnicoForm.get('password')?.markAsUntouched();
      this.tecnicoForm.get('confirmpassword')?.markAsUntouched();
    } else {
      // Restaurar los valores vacíos y limpiar los errores
      this.tecnicoForm.patchValue({
        password: '',
        confirmpassword: '',
      });

      // Marcar los campos password y confirmpassword como no tocados
      this.tecnicoForm.get('password')?.markAsUntouched();
      this.tecnicoForm.get('confirmpassword')?.markAsUntouched();
    }

    // Actualizar los validators de password y confirmPassword
    this.updatePasswordValidators();
  }

  /**
   * Getter para acceder al FormArray de especialidades
   */
  get especialidades(): FormArray {
    return this.tecnicoForm.get('especialidades') as FormArray;
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
   * Carga los valores del formulario con los datos del técnico a actualizar
   * @param data Datos del técnico obtenidos del API
   */
  private patchFormValues(data: UsuarioModel) {
    //setValue de los campos del formulario
    this.tecnicoForm.patchValue({
      id: data.id,
      nombreUsuario: data.nombreUsuario,
      nombreCompleto: data.nombreCompleto,
      telefono: data.telefono ? data.telefono : '', // Si el teléfono es null, asignar cadena vacía
      correo: data.correo,
      rol: 'TECNICO', // Rol fijo para técnico
      estadoTecnico: data.estadoTecnico || 'DISPONIBLE', // Incluir estado
      cargaTrabajo: data.cargaTrabajo || 0, // Incluir carga
      activo: data.activo ?? true, // Incluir activo
      foto: data.foto, // Incluir foto
    });

    // Actualiza la imagen previa
    this.nameImage = data.foto || 'image-not-found.jpg';
    this.previousImage = data.foto;

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

    // En modo edición, iniciar el formulario sin validaciones de contraseña (updatePasswordValidators)
    this.updatePasswordValidators();

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
   * Elimina una especialidad del FormArray según el índice
   * @param index Índice de la especialidad a eliminar
   */
  removeEspecialidad(index: number) {
    // VALIDACIÓN: En modo edición, permitir eliminar hasta quedar sin especialidades
    // En modo creación, mantener al menos una

    const titleKey = "TECNICO_NOTIFICACION.ESPECIALIDAD_REQUERIDA_TITULO";
    const messageKey = "TECNICO_NOTIFICACION.ESPECIALIDAD_REQUERIDA_MENSAJE";

    this.translate.get([titleKey, messageKey]).subscribe(translations => {
      if (this.isCreate && this.especialidades.length <= 1) {
        this.noti.warning(
          translations[titleKey],
          translations[messageKey],
          3000
        );
        return;
      }
    });

    // // CONFIRMACIÓN: En modo edición, preguntar antes de eliminar si queda solo una
    // if (!this.isCreate && this.especialidades.length === 1) {
    //   const confirmar = confirm('¿Está seguro de eliminar la última especialidad? El técnico quedará sin especialidades.');
    //   if (!confirmar) {
    //     return;
    //   }
    // }

    // Eliminar la especialidad
    this.especialidades.removeAt(index);

    // Actualizar el control del formulario
    this.tecnicoForm.setControl('especialidades', this.fb.array(this.especialidades.controls));

    console.log(`Especialidad ${index} eliminada. Quedan: ${this.especialidades.length}`);

    // AGREGAR especialidad vacía si no quedan y estamos creando
    if (this.isCreate && this.especialidades.length === 0) {
      this.addEspecialidad();
    }
  }

  /**
   * Gestiona la selección de archivo para la imagen del técnico
   * @param event Evento de cambio de input file
   */
  selectFile(event: Event) {
    // constante para el input de archivo
    const input = event.target as HTMLInputElement;

    const titleKey1= 'TECNICO_NOTIFICACION.TIPO_ARCHIVO_INVALIDO_TITULO';
    const messageKey1 = 'TECNICO_NOTIFICACION.TIPO_ARCHIVO_INVALIDO_MENSAJE';
    const titleKey2 = 'TECNICO_NOTIFICACION.ARCHIVO_GRANDE_TITULO';
    const messageKey2 = 'TECNICO_NOTIFICACION.ARCHIVO_GRANDE_MENSAJE';

    // Si existe un archivo seleccionado, leerlo y generar vista previa
    if (input.files?.[0]) {
      // Validar primero el tipo de archivo
      this.translate.get([titleKey1, messageKey1, titleKey2, messageKey2]).subscribe(translations => {
        if (!input.files?.[0].type.startsWith('image/')) {
          this.noti.error(translations[titleKey1], translations[messageKey1], 3000);
          this.tecnicoForm.invalid;
          return;
        }
      });

      // Validar el tamaño del archivo (2 MB máximo)
      if (input.files?.[0].size > 2 * 1024 * 1024) {
        this.translate.get([titleKey1, messageKey1, titleKey2, messageKey2]).subscribe(translations => {
          this.noti.error(translations[titleKey2], translations[messageKey2], 3000);
        });
        return;
      }

      // Asignar el archivo seleccionado a currentFile
      this.currentFile = input.files[0];

      // Asignar el nombre del archivo seleccionado
      this.nameImage = this.currentFile.name;

      // Inicializar una constante FileReader para leer el archivo
      const reader = new FileReader();

      // Leer el archivo y asignar el resultado a la variable preview para vista previa
      reader.onload = (e) => (this.preview = e.target?.result as string);
      reader.readAsDataURL(this.currentFile);

      // Si no hay un archivo seleccionado, restaurar la imagen previa
    } else {
      // Limpiar currentFile y restaurar preview y nameImage
      this.currentFile = undefined;
      this.preview = '';
      this.nameImage = this.previousImage || 'image-not-found.jpg';
    }
  }

  /**
   * Elimina la imagen seleccionada y restaura la imagen por defecto
   */
  removeImage() {
    // Limpiar el archivo actual y la vista previa
    this.currentFile = undefined;
    this.preview = '';

    // Restaurar la imagen por defecto
    this.nameImage = 'image-not-found.jpg';

    // Limpiar el input file
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Comportamiento diferente para el manejo de la imagen según el modo
    if (this.isCreate) {
      // Modo creación: usar imagen por defecto
      this.nameImage = 'image-not-found.jpg';
    } else {
      // Modo edición: marcar para eliminación
      this.nameImage = 'image-not-found.jpg';
      console.log('Imagen marcada para eliminación en modo edición');

      // Opcional: Mostrar confirmación
      const titleKey = "TECNICO_NOTIFICACION.IMAGEN_ELIMINADA_TITULO";
      const messageKey = "TECNICO_NOTIFICACION.IMAGEN_ELIMINADA_MENSAJE";
      this.translate.get([titleKey, messageKey]).subscribe(translations => {
        this.noti.info(translations[titleKey], translations[messageKey], 3000);
      });
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
   * Envía el formulario: valida, carga la imagen y guarda/actualiza el técnico
   */
  submitTecnico() {
    this.debugFormulario(); // LLAMADA A LA FUNCIÓN DE DEBUG

    // Marcar todos los campos del formulario como "tocados" para activar validaciones
    this.tecnicoForm.markAllAsTouched();

    // Marcar cada control dentro del FormArray 'especialidades' como "tocado"
    this.especialidades.controls.forEach((group) => group.markAllAsTouched());

    // Si el formulario es inválido, mostrar notificación de error y salir
    if (this.tecnicoForm.invalid) {
      const titleKey = 'TECNICO_NOTIFICACION.FORMULARIO_INVALIDO_TITULO';
      const messageKey = 'TECNICO_NOTIFICACION.FORMULARIO_INVALIDO_MENSAJE';
      this.translate.get([titleKey, messageKey]).subscribe(translations => {
        this.noti.error(translations[titleKey], translations[messageKey], 5000);
      });
      return;
    }

    // Prepara payloads para el API
    const formValue = this.tecnicoForm.value;
    console.log('Datos a enviar al API:', formValue); // MOSTRAR LOS VALORES DEL FORMULARIO EN CONSOLA

    // Preparar payload de especialidades
    const especialidadesIds = this.especialidades.value
      .map((esp: any) => esp.especialidadId)
      .filter((id: any) => id !== null && id !== undefined);

    // Función interna para guardar o actualizar técnico
    const saveTecnico = () => {
      let payload = {
        // Copiar todos los valores del formulario y además asignar especialidades e imagen
        ...formValue,
        // Enviar especialidades como objetos con id
        especialidades: especialidadesIds.map((id: number) => ({ id })),
        foto: this.nameImage,
      };

      // En modo edición, incluir password solo si changePassword es true (el usuario va a cambiar la contraseña)
      if (!this.isCreate) {
        // Si hay campo password en el formulario, incluirlo en el payload
        if (this.changePassword && formValue.password) {
          payload.password = formValue.password;
        }

        // Si no se va a cambiar la contraseña, asegurarse de no enviar el campo password y confirmpassword
        else {
          const { password, confirmpassword, ...payloadSinPassword } = payload;
          payload = payloadSinPassword;
        }
      } else {
        // Remover confirm password del payload ya que no es necesario enviarlo al API
        const { confirmpassword, ...payloadSinConfirmPassword } = payload;

        payload = payloadSinConfirmPassword;
      }

      console.log('Payload enviado al API:', payload); // MOSTRAR EL PAYLOAD EN CONSOLA

      // Llamar al servicio correspondiente según si es creación o actualización
      const request$ = this.isCreate
        ? this.tecnicoService.create(payload)
        : this.tecnicoService.update(payload);

      // Suscribirse a la respuesta del API y mostrar notificación de éxito
      request$.pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          const tecnico = response; // Obtener el técnico desde la respuesta del API
          console.log('Técnico procesado exitosamente:', tecnico.nombreCompleto);
          // Éxito: mostrar notificación y navegar

          const titleKey = this.isCreate ? 'TECNICO_NOTIFICACION.CREAR_TITULO' : 'TECNICO_NOTIFICACION.ACTUALIZAR_TITULO';
          const messageKey = this.isCreate ? 'TECNICO_NOTIFICACION.CREAR_EXITO' : 'TECNICO_NOTIFICACION.ACTUALIZAR_EXITO';

          this.translate
            .get([titleKey, messageKey], { nombre: tecnico.nombreCompleto })
            .subscribe((translations) => {
              this.noti.success(translations[titleKey], translations[messageKey], 5000, '/tecnico');
            });
        },
        error: (error) => {
          // Manejo de errores
          console.error('[FRONTEND] Error al procesar técnico:', error);

          // Variable tipo string para mostrar error en la notificación
          let errorMessage = 'Error al procesar el técnico. Inténtelo de nuevo.';

          // Manejo de errores http específicos
          let errorMessageKey = 'TECNICO_NOTIFICACION.ERROR_GENERICO';

          // Si se recibe un error 400 (Bad Request) o 500 (Internal Server Error) desde el API
          if (error.status === 400 || error.status === 500) {
            // Si el mensaje del error incluye 'nombreUsuario' asignarlo a errorMessage
            if (error.error?.message?.includes('nombreUsuario')) {
              errorMessageKey = 'TECNICO_NOTIFICACION.ERROR_NOMBRE_USUARIO';
            }
            // Si el mensaje del error incluye 'correo' asignarlo a errorMessage
            else if (error.error?.message?.includes('correo')) {
              errorMessageKey = 'TECNICO_NOTIFICACION.ERROR_CORREO';
            }
            // Si el error tiene un mensaje asignarlo a errorMessage
            else if (error.error?.message) {
              errorMessage = error.error.message;
            }
          }

          // Mostrar el toast de error con el mensaje personalizado y traducido
          const titleKey = this.isCreate ? 'TECNICO_NOTIFICACION.ERROR_CREAR_TITULO' : 'TECNICO_NOTIFICACION.ERROR_ACTUALIZAR_TITULO';

          this.translate.get([titleKey, errorMessageKey]).subscribe(translations => {
            this.noti.error(
              translations[titleKey],
              translations[errorMessageKey],
              5000
            );
          });
          },
      });
    };

    // Primero subir imagen si se seleccionó archivo
    if (this.currentFile) {
      this.uploadService
        .upload(this.currentFile, this.previousImage)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data) => {
          this.nameImage = data.fileName;
          saveTecnico();
        });
    } else {
      saveTecnico();
    }
  }

  /**
   * Resetea el formulario a valores iniciales
   */
  onReset() {
    this.tecnicoForm.reset({
      rol: 'TECNICO',
      estadoTecnico: 'DISPONIBLE',
      cargaTrabajo: 0,
      activo: true,
      foto: 'image-not-found.jpg',
    });
    this.preview = '';
    this.currentFile = undefined;
    this.nameImage = 'image-not-found.jpg';
    this.especialidades.clear();
    this.addEspecialidad();

    // Resetear la bandera changePassword según el modo
    // y actualizar los validators de contraseña
    this.changePassword = this.isCreate;
    this.updatePasswordValidators();
  }

  /**
   * Navega de regreso a la lista de técnicos
   */
  goBack() {
    this.router.navigate(['/tecnico']);
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
    console.log('Formulario:', this.tecnicoForm);
    console.log('Estado del formulario:', this.tecnicoForm.status);
    console.log('Valores del formulario:', this.tecnicoForm.value);
    console.log('Errores generales del formulario:', this.tecnicoForm.errors);

    console.log('====== CAMPOS INDIVIDUALES DEL FORMULARIO ======');

    // Iterar sobre cada control del formulario y mostrar su estado
    Object.keys(this.tecnicoForm.controls).forEach((key) => {
      // Obtener el control por su clave
      const control = this.tecnicoForm.get(key);

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

    console.log('====== FIN DEL DEBUG DEL FORMULARIO ======\n');
  }
}
