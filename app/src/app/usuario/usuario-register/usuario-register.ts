import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { passwordsMatchValidator } from '../../share/validators/password-match-validator';
import { RolModel } from '../../share/models/RolModel';
import { RolService } from '../../share/services/api/rol.service';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { NotificationService } from '../../share/services/app/notification.service';

@Component({
  selector: 'app-usuario-register',
  standalone: false,
  templateUrl: './usuario-register.html',
  styleUrls: ['./usuario-register.css'],
})
export class UsuarioRegister implements OnInit, OnDestroy {
  hidePassword = true; // Para mostrar/ocultar la contraseña
  hideConfirmPassword = true; // Para mostrar/ocultar la confirmación de contraseña
  registerForm!: FormGroup; // Formulario reactivo
  loading = false; // Indicador de carga

  // Lista de roles a través de Signals

  roles = signal<RolModel[]>([]); // Lista de roles disponibles

  // Subject para manejar la destrucción del componente y evitar memory leaks
  private destroy$ = new Subject<void>();

  // Regex para validación de email y teléfono
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  phonePattern = /^\+?[1-9]\d{1,14}$/;

  // Método constructor con inyección de dependencias
  constructor(
    public fb: FormBuilder,
    private router: Router,
    private rolService: RolService,

    // Inyección del servicio de notificaciones
    private notificacion: NotificationService,
    private usuarioService: UsuarioService
  ) {}

  /**
   * Ciclo de vida OnInit: inicializa el formulario y carga roles
   */
    ngOnInit(): void {
      this.initForm();        // Inicializa el formulario reactivo
      this.debugFormulario(); // Debuggear el formulario
      this.getRoles();        // Cargar roles desde el backend

    }

  /**
   * Inicializa el formulario reactivo con Validaciones
   * @returns void
   */
  private initForm(): void {
    this.registerForm = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]], // Nombre de usuario requerido, mínimo 5, máximo 20 caracteres
      nombreCompleto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]], // Nombre completo requerido, mínimo 3, máximo 50 caracteres
      correo: ['', [Validators.required, Validators.pattern(this.emailPattern)]], // Correo electrónico requerido con patrón de validación
      telefono: ['', [Validators.pattern(this.phonePattern), Validators.minLength(8), Validators.maxLength(15)]], // Teléfono opcional con patrón de validación, mínimo 8, máximo 15 caracteres
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]], // Contraseña requerida, mínimo 6 caracteres, máximo 20 caracteres
      confirmpassword: ['', [Validators.required]], // Confirmación de contraseña requerida
      rol: ['CLIENTE'], // Valor por defecto para el usuario "CLIENTE"
      foto: ['image-not-found.jpg'] // Imagen por defecto para el usuario "image-not-found.jpg"
    }, { validators: passwordsMatchValidator }); // Validador personalizado para verificar que las contraseñas coincidan
  }

  /**
   * Función para obtener los roles mediante el servicio desde
   * el backend
   */
  getRoles() {

    // Suscribirse al servicio de roles y asignar la respuesta a la señal roles
    this.rolService.get().subscribe((roles: RolModel[]) => {
      this.roles.set(roles);
    });
  }

  /**
   * Función para enviar información al backend para registrar un nuevo usuario
   */
  submitForm() {

    this.debugFormulario(); // LLAMADA A FUNCIÓN DE DEBUG

    // Marcar todos los campos como tocados para activar las validaciones
    this.registerForm.markAllAsTouched();

    //Validación del formulario (si no es correcto no hacer nada)
    if (this.registerForm.invalid) {
      this.notificacion.error('Formulario Inválido', 'Revise los campos marcados.', 5000);
      return;
    }

    // Activar / cambiar a true el indicador de carga
    this.loading = true;

    /** CREAR / REGISTRAR USUARIO */

    // Preparar payload para el API 
    const formValue = this.registerForm.value;

    // Remover confirm password del payload ya que no es necesario enviarlo al API
    const { confirmpassword, ...payload } = formValue;

    // Debuggear los datos a enviar al API
    console.log('Datos a enviar al API:', payload); 

    // Crear el usuario a través del método Create de usuarioService
    this.usuarioService.registerUser(payload)
      .pipe(takeUntil(this.destroy$))

      // Suscribirse al observable para manejar la respuesta del API
      .subscribe({
        next: (data) => {

          // Desactivar el indicador de carga
          this.loading = false; 

          // Mostrar en consola el mensaje de creación de usuario exitosa
          console.log('Usuario registrado exitosamente:', data);

          // Mostrar el toast de éxito y devolver a /usuario/login después de 3 segundos
          this.notificacion.success(
            'Usuario Registrado', 
            'El usuario ha sido registrado exitosamente.', 
            3000, 
            '/usuario/login'
          );
        },

        // En caso de haber error 
        error: (error) => {

          // Desactivar el indicador de carga
          this.loading = false;

          // Mostrar en consola el mensaje de error a la hora de crear usuario
          console.error('Error al registrar usuario:', error);
          
          // Variable tipo string para mostrar error en la notificación
          let errorMessage = 'Error al registrar usuario. Inténtelo de nuevo.';
          
          // Manejo de errores http específicos

          // Si se recibe un error 400 (Bad Request) desde el API
          if (error.status === 400) {

            // Si el mensaje del error incluye 'nombreUsuario' asignarlo a errorMessage
            if (error.error?.message?.includes('nombreUsuario')) {
              errorMessage = 'El nombre de usuario ya está en uso.';

            // En caso de que el mensaje de error contenga 'correo' asignarlo a errorMessage
            } else if (error.error?.message?.includes('correo')) {
              errorMessage = 'El correo electrónico ya está registrado.';
            
            // Por último, si el error tiene un mensaje asignarlo a errorMessage
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }
          }
          
          // Mostrar el toast de error con el mensaje correspondiente
          this.notificacion.error('Error de Registro', errorMessage);
        }
      });
  }

  /**
   * Función para resetear el formulario de registro
   */
  onReset() {
    this.registerForm.reset();
  }

  /** 
   * Navegar a la página de login de usuario
   */
  goToLogin(): void {
    this.router.navigate(['/usuario/login']);
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
    console.log('Formulario:', this.registerForm);
    console.log('Estado del formulario:', this.registerForm.status);
    console.log('Valores del formulario:', this.registerForm.value);
    console.log('Errores generales del formulario:', this.registerForm.errors);

    console.log('====== CAMPOS INDIVIDUALES DEL FORMULARIO ======');

    // Iterar sobre cada control del formulario y mostrar su estado
    Object.keys(this.registerForm.controls).forEach(key => {

      // Obtener el control por su clave
      const control = this.registerForm.get(key);

      // Si el control existe, mostrar su estado
      if (control) {
        console.log(`CAMPO ${key}: ${control.valid ? 'VÁLIDO' : 'INVÁLIDO'} `, {
          valor: control.value,
          tocado: control.touched,
          errores: control.errors,

        });
      }
    });
  }
}
