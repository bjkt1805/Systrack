import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../share/services/app/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { Subject } from 'rxjs/internal/Subject';

@Component({
    selector: 'app-usuario-login',
    standalone: false,
    templateUrl: './usuario-login.html',
    styleUrls: ['./usuario-login.css']
})

export class UsuarioLogin implements OnInit, OnDestroy {

    // Subject para manejar la destrucción del componente y evitar memory leaks
    private destroy$ = new Subject<void>();

    loginForm!: FormGroup; // FormGroup para el formulario de login
    hidePassword = true; // Control para mostrar/ocultar contraseña
    loading = false; // Indicador de carga

    // Expresión regular para validación de email
    emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Método constructor con inyección de dependencias
    constructor(
        private fb: FormBuilder,
        private authService: AuthenticationService,
        private router: Router,

        // Inyección del servicio de notificaciones
        private noti: NotificationService,

        // Inyección del servicio de traducción
        private translate: TranslateService
    ) { }

    // Inicialización del componente
    ngOnInit(): void {
        this.initForm();            // Inicializa formulario reactivo
        this.debugFormulario();     // Función de debug del formulario
    }

    // Resetear el formulario de login
    onReset() {
        this.loginForm.reset();
    }

    // Inicializar el formulario de login con validaciones
    private initForm(): void {
        this.loginForm = this.fb.group({

            // Utilizar validators para los campos 
            // (expresion regular para email, required y longitud mínima para contraseña)
            email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
        });
    }

    // Manejar el envío del formulario de login
    onSubmit(): void {

        // Si el formulario es inválido
        // marcar todos los campos como tocados para mostrar errores
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            this.translate.get([
                'USUARIO_LOGIN.FORMULARIO_INCOMPLETO',
                'USUARIO_LOGIN.FORMULARIO_INCOMPLETO_MENSAJE'
            ]).subscribe(translations => {
                this.noti.warning(
                    translations['USUARIO_LOGIN.FORMULARIO_INCOMPLETO'],
                    translations['USUARIO_LOGIN.FORMULARIO_INCOMPLETO_MENSAJE']
                );
            });
            return;
        }

        // Indicar que se está procesando el login
        this.loading = true;

        // Obtener las credenciales del formulario
        const credentials = this.loginForm.value;

        // Llamar al servicio de autenticación para iniciar sesión
        this.authService.loginUser(credentials).subscribe({
            next: (response) => {
                this.loading = false;

                // Navegar a la página de inicio tras el login exitoso
                if (response && response.success) {
                    this.translate.get([
                        'USUARIO_LOGIN.INICIO_SESION_EXITOSO',
                        'USUARIO_LOGIN.INICIO_SESION_EXITOSO_MENSAJE'
                    ]).subscribe(translations => {
                        this.noti.success(
                            translations['USUARIO_LOGIN.INICIO_SESION_EXITOSO'],
                            translations['USUARIO_LOGIN.INICIO_SESION_EXITOSO_MENSAJE'],
                            3000,
                            '/inicio'
                        );
                    });
                    
                }
            },

            // Manejo de errores durante el login
            error: (error) => {

                // Configurar el indicador de carga a "false" y mostrar notificación de error
                this.loading = false;

                //Mostrar en consola el mensaje de error
                console.error('Error de autenticación:', error);

                // Configurar la variable errorMessage para mostrar el mensaje de error
                let errorMessage = 'Error al iniciar sesión. Por favor, inténtelo de nuevo.';

                // Si el error http es 401 (no autorizado) cambiar el mensaje de error
                if (error.status === 401) {
                    errorMessage = 'Credenciales incorrectas. Por favor, verifique su correo y contraseña.';
                }

                // Si es otro error asignar a errorMessage el mensaje recibido del servidor
                else if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                }

                // Mostrar notificación de error con el mensaje recibido del servidor
                this.translate.get([
                    'USUARIO_LOGIN.ERROR_AUTENTICACION',
                    'USUARIO_LOGIN.ERROR_AUTENTICACION_MENSAJE'
                ]).subscribe(translations => {
                    this.noti.error(
                        translations['USUARIO_LOGIN.ERROR_AUTENTICACION'],
                        translations['USUARIO_LOGIN.ERROR_AUTENTICACION_MENSAJE'],  
                        3000
                    );
                });

            }
        });
    }

    // Navegar a la página de registro de usuario
    goToRegister(): void {
        this.router.navigate(['/usuario/register']);
    }

    // Navegar a la página de restablecimiento de contraseña
    goToResetPassword(): void {
        this.router.navigate(['/usuario/reset-password']);
        console.log('Navegando a la página de restablecimiento de contraseña', this.router);
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
        console.log('Formulario:', this.loginForm);
        console.log('Estado del formulario:', this.loginForm.status);
        console.log('Valores del formulario:', this.loginForm.value);
        console.log('Errores generales del formulario:', this.loginForm.errors);

        console.log('====== CAMPOS INDIVIDUALES DEL FORMULARIO ======');

        // Iterar sobre cada control del formulario y mostrar su estado
        Object.keys(this.loginForm.controls).forEach(key => {

            // Obtener el control por su clave
            const control = this.loginForm.get(key);

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