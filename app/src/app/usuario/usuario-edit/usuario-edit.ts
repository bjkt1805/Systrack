import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { UsuarioModel } from '../../share/models/UsuarioModel';

@Component({
    selector: 'app-usuario-edit',
    standalone: false,
    templateUrl: './usuario-edit.html',
    styleUrls: ['./usuario-edit.css'],
})

export class UsuarioEdit implements OnInit, OnDestroy {

    // Formulario reactivo 
    editForm!: FormGroup;

    // Estado de carga 
    loading = signal<boolean>(false);

    // ID del usuario a editar
    usuarioId!: number;

    // Usuario a editar
    usuarioDatos = signal<UsuarioModel | null>(null);

    // Subject para manejar la destrucción del componente y evitar memory leaks
    private destroy$ = new Subject<void>();

    // Regex para validación de email 
    emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Regex para validación de teléfono
    phonePattern = /^[0-9]{7,15}$/;

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

        // Obtener ID del usuario desde la ruta
        this.route.params.subscribe(params => {
            this.usuarioId = params['id'] ?? null;

            // Validación del ID del usuario
            if (this.usuarioId && !isNaN(this.usuarioId)) {
                this.cargarUsuario(this.usuarioId);
            } else {
                console.error('ID de usuario inválido');
                this.router.navigate(['/usuario']);
            }

            // Inicializar el formulario de edición
            this.initForm();

            // Cargar datos del usuario
            this.cargarUsuario(this.usuarioId);
        });
    }

    /**
     * Inicialización del formario 
     * @return void
     */
    private initForm(): void {
        this.editForm = this.fb.group({
            id: [this.usuarioId],
            nombreUsuario: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
            nombreCompleto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            correo: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
            telefono: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
            activo: [true]

        })
    }

    /**
     * Cargar datos del usuario a editar
     * @param id ID del usuario
     * @return void
     */
    private cargarUsuario(id: number): void {
        this.loading.set(true);

        this.usuarioService.getById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (usuario) => {
                    if (!usuario) {
                        console.error('Usuario no encontrado');
                        this.router.navigate(['/usuario']);
                        return;
                    };

                    this.usuarioDatos.set(usuario);

                    // Rellenar el formulario con los datos del usuario
                    this.editForm.patchValue({
                        id: usuario.id,
                        nombreUsuario: usuario.nombreUsuario,
                        nombreCompleto: usuario.nombreCompleto,
                        correo: usuario.correo,
                        telefono: usuario.telefono,
                        activo: usuario.activo,
                    });

                    this.loading.set(false);
                    console.log('[FRONTEND] Usuario cargado:', usuario);
                },
                error: (error: Error) => {
                    console.error('Error al cargar el usuario:', error);
                    this.noti.error('Error', 'Error al cargar el usuario: ' + error.message);
                    this.loading.set(false);
                    return;
                }
            })
    }

    /**
     * Enviar el formulario al backend
     */
    submitForm(): void {

        // Marcar todos los campos como touched
        this.editForm.markAllAsTouched();

        // Validar el formulario 
        if (this.editForm.invalid) {
            this.noti.error('Datos inválidos', 'Por favor, corrija los errores en el formulario.');
            return;
        }

        this.loading.set(true);

        // Preparar el payload

        const formValue = this.editForm.value;

        const payload = {
            ...formValue,
        }

        // Enviar la solicitud de actualización al servicio
        console.log('[FRONTEND] Enviando payload de actualización:', payload);

        this.usuarioService.update(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.loading.set(false);
                    console.log('[FRONTEND] Usuario actualizado con éxito:', response);

                    this.noti.success('Éxito', 'Usuario actualizado correctamente.');
                    this.router.navigate(['/']);
                },
                error: (error: Error) => {
                    this.loading.set(false);
                    console.error('Error al actualizar el usuario:', error);
                    this.noti.error('Error', 'Error al actualizar el usuario: ' + error.message);
                }
            });
    }

    /**
     * Resetar el formulario a los valores originales
     */
    onReset(): void {
        const usuario = this.usuarioDatos();
        if (usuario) {
            this.editForm.patchValue({
                nombreUsuario: usuario.nombreUsuario,
                nombreCompleto: usuario.nombreCompleto,
                correo: usuario.correo,
                telefono: usuario.telefono,
                activo: usuario.activo,
            })
        }
    }

    /**
     * Cancelar y volver
     */
    onCancel(): void {
        this.router.navigate(['/usuario']);
    }

    /**
     * Método OnDestroy para limpiar recursos
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}