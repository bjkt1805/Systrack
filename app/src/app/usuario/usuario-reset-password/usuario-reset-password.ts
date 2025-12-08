import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { passwordsMatchValidator } from '../../share/validators/password-match-validator';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { NotificationService } from '../../share/services/app/notification.service';


@Component({
    selector: 'app-usuario-reset-password',
    standalone: false,
    templateUrl: './usuario-reset-password.html',
    styleUrls: ['./usuario-reset-password.css'],
})

export class UsuarioResetPassword implements OnInit, OnDestroy {

    // formulario reactivo para solicitar correo, cambiar contraseña 
    resetForm!: FormGroup

    // indicador de carga
    loading = signal<boolean>(false);

    // Ocultar/mostrar contraseña 
    hidePassword = true;
    hideConfirmPassword = true;

    // Subject para manejar la destrucción del componente y evitar memory leaks
    private destroy$ = new Subject<void>();

    // Regex para validación de email
    emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Método constructor con inyección de dependencias
    constructor(
        private fb: FormBuilder,
        private usuarioService: UsuarioService,
        private route: ActivatedRoute,
        private router: Router,
        private noti: NotificationService,
    ) { }

    // Método OnInit para inicializar componente
    ngOnInit(): void {
        this.initForm();
    }

    /**
     * Inicializa el formulario reactivo para restablecer la contraseña
     */
    private initForm(): void {
        this.resetForm = this.fb.group({
            nombreUsuario: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
            nuevaPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
            confirmarPassword: ['', [Validators.required]],
        }, { validators: passwordsMatchValidator });
    }

    /**
     * Método onSubmit para manejar el envío del formulario de restablecimiento de contraseña
     */
    onSubmit(): void {

        // Marcar todos los campos como tocados 
        this.resetForm.markAllAsTouched();

        // Validar el formulario 
        if (this.resetForm.invalid) {
            this.noti.error('Datos inválidos', 'Por favor, corrija los errores en el formulario.');
            return;
        }

        this.loading.set(true);

        // Preparar el payload para enviar al API 
        const nombreUsuario = this.resetForm.get('nombreUsuario')?.value.trim();
        const contrasenna = this.resetForm.get('nuevaPassword')?.value;

        this.usuarioService.resetPassword(nombreUsuario, contrasenna)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.loading.set(false);
                    console.log('[FRONTEND] Contraseña restablecida con éxito:', response);

                    this.noti.success("Éxito", "Contraseña restablecida correctamente.");
                    this.router.navigate(['/usuario/login']);
                },
                error: (error: Error) => {
                    this.loading.set(false);
                    console.error('Error al restablecer la contraseña:', error);
                    this.noti.error('Error', 'Error al restablecer la contraseña: ' + error.message);
                }

            })
    }

    /** 
     * Navegar a la página de login de usuario
     */
    goToLogin(): void {
        this.router.navigate(['/usuario/login']);
    }

    /**
     * Método para resetear el form si se da clic en cancelar
     */
    onReset() {
        this.resetForm.reset();
    }

    /**
     * Método OnDestroy para limpiar recursos al destruir el componente
     */

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}