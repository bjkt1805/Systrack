import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// Servicios
import { TicketService } from '../../share/services/api/ticket.service';
import { TecnicoService } from '../../share/services/api/tecnico.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { FileUploadService } from '../../share/services/api/file-upload.service';

// Modelos
import { EstadoTicket } from '../../share/models/EnumsModel';
import { TicketModel } from '../../share/models/TicketModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';

// Interfaz para mapear los datos del diálogo (tiquete, estadosDisponibles, usuarioLogueado)
interface DialogData {
    ticket: TicketModel;
    estadosDisponibles: EstadoTicket[];
    usuarioLogueado: UsuarioModel | null;
}

@Component({
    selector: 'app-ticket-historial-view-dialog',
    standalone: false,
    templateUrl: './ticket-historial-view-dialog.html',
    styleUrl: './ticket-historial-view-dialog.css'
})

export class TicketHistorialViewDialog implements OnInit {

    // Inyeccion de dependencias 
    private fb = inject(FormBuilder);
    private ticketService = inject(TicketService);
    private tecnicoService = inject(TecnicoService);
    private uploadService = inject(FileUploadService);
    private noti = inject(NotificationService);
    private dialogRef = inject(MatDialogRef<TicketHistorialViewDialog>);

    // Formulario reactivo por medio de FormGroup
    estadoForm!: FormGroup;

    // Estado de envío a través de una Signal 
    enviando = signal(false);

    // Signal para manejar los técnicos disponibles (arreglo) para asignar tiquete 
    tecnicos = signal<any[]>([]);

    // Signal para manejar la carga de técnicos 
    cargandoTecnicos = signal(false);

    // Signal para verificar si el usuario es ADMIN 
    esAdmin = signal(false);

    // Signal para verificar si puede asignar técnicos 
    puedeAsignarTecnicos = signal(false);

    // Manejo de imágenes a través de signals y limites (cant Imagenes y tamaño)
    imagenesSeleccionadas = signal<File[]>([]);
    imagenesPreview = signal<string[]>([]);
    readonly maxImagenes = 5; // Cantidad máxima de imágenes
    readonly maxTamanoImagenMB = 2; // Tamaño máximo en MB

    // Mapeo de los estados a etiquetas mediante Record/Mapa 
    readonly estadoLabels: Record<EstadoTicket, string> = {
        [EstadoTicket.PENDIENTE]: 'Pendiente',
        [EstadoTicket.ASIGNADO]: 'Asignado',
        [EstadoTicket.EN_PROCESO]: 'En Proceso',
        [EstadoTicket.RESUELTO]: 'Resuelto',
        [EstadoTicket.CERRADO]: 'Cerrado'
    }

    // Mapeo de íconos por estado del tiquete mediante Record/Mapa
    readonly estadoIcons: Record<EstadoTicket, string> = {
        [EstadoTicket.PENDIENTE]: 'pending',
        [EstadoTicket.ASIGNADO]: 'person_add',
        [EstadoTicket.EN_PROCESO]: 'autorenew',
        [EstadoTicket.RESUELTO]: 'check_circle',
        [EstadoTicket.CERRADO]: 'lock'
    };

    // Método constructor para el dialog cargando los datos del tiquete mediante la interfaz
    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) { 
        // Determinar si el usuario logueado es ADMIN
        const usuario = this.data.usuarioLogueado; 
        if (usuario && usuario.rol === 'ADMIN') {
            this.esAdmin.set(true); // Es ADMIN = true
            this.puedeAsignarTecnicos.set(true); // Pede Asignar Tecnico = true
        }

        console.log('[DIALOG] Usuario logueado:', usuario);
        console.log('[DIALOG] Es Admin:', this.esAdmin());
        console.log('[DIALOG] Puede asignar técnico:', this.puedeAsignarTecnicos());
        console.log('[DIALOG] Ticket:', this.data.ticket);
    }

    // Método ngOnInit para inicializar el formulario y cargar técnicos si es necesario
    ngOnInit(): void {
        this.initForm();

        // Los técnicos solo pueden cargarse si el usuario logueado tiene rol ADMIN
        if (this.esAdmin()){
            this.cargarTecnicos();
        }
    }

    /**
     * Inicializa el formulario reactivo con validaciones
     */
    private initForm(): void {
        this.estadoForm = this.fb.group({
            nuevoEstado: [null, Validators.required],
            nota: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(191)]], // Nota requerida con longitud mínima y máxima

            // Si el usuario no es admin, deshabilitar el campo usuarioAsignadoId porque 
            // cliente o técnico no puede asignar el tiquete. 
            usuarioAsignadoId: [
                {
                    value: this.data.ticket.usuarioAsignado?.id || 1, 
                    disabled: !this.esAdmin() // Deshabilitar si esAdmin es false
                }
            ]
        });

        console.log("Id de técnico asignado: ", this.estadoForm.get('usuarioAsignadoId')?.value);

        // Subscribirse a los cambios en el estado para validar el técnico asignado 
        this.estadoForm.get('nuevoEstado')?.valueChanges.subscribe((estado: EstadoTicket) => {
            this.validarTecnicoRequerido(estado);
        });

    }

    /** 
     * Validar si se requiere un técnico asignado según el estado del tiquete 
     */
    private validarTecnicoRequerido(estado: EstadoTicket): void {
        const tecnicoControl = this.estadoForm.get('usuarioAsignadoId');

        // El técnico es requerido para estados diferentes a PENDIENTE
        if (this.esAdmin() && estado && estado !== EstadoTicket.PENDIENTE) {
            tecnicoControl?.setValidators([Validators.required]); // Establecer como requerido
            tecnicoControl?.enable(); // Habilitar el campo
        } else {
            tecnicoControl?.clearValidators(); // Limpiar validators si no es requerido

            // Si el usuario no es admin, mantener tecnicoControl deshabilitado
            if (!this.esAdmin()) {
                tecnicoControl?.disable();
            }
        }
        tecnicoControl?.updateValueAndValidity(); // Actualizar el estado del control
    }

    /** 
     * Cargar la lista de técnicos disponibles 
     */
    private cargarTecnicos(): void {
        this.cargandoTecnicos.set(true); // Indicar que se están cargando técnicos

        this.tecnicoService.getAvailable().subscribe({
            next: (tecnicos) => {
                console.log('[DIALOG] Técnicos cargados:', tecnicos);
                this.tecnicos.set(tecnicos); // Actualizar la signal con los técnicos cargados
                this.cargandoTecnicos.set(false); // Indicar que la carga ha finalizado
            },
            error: (error) => {
                console.error('[DIALOG] Error al cargar técnicos:', error);
                this.noti.error('Error', 'No se pudieron cargar los técnicos'); // Mostrar toast de error
                this.cargandoTecnicos.set(false); // Indicar que la carga ha finalizado
            }
        })
    }

    /**
     * Seleccionar archivos de imagen para adjuntar al tiquete
     */
    onFileSelected(event: Event): void {

        // Obtener el input de archivos del evento
        const input = event.target as HTMLInputElement;

        // Si no hay archivos, salir del método
        if (!input.files) {
            return;
        }

        // Construir el array con las imágenes seleccionadas
        const archivos = Array.from(input.files);

        // Asignar a imagenesActuales las imágenes seleccionadas 
        const imagenesActuales = this.imagenesSeleccionadas();

        // Validar la cantidad máxima de imágenes
        if (imagenesActuales.length + archivos.length > this.maxImagenes) {
            this.noti.error('Límite excedido', `No se pueden seleccionar más de ${this.maxImagenes} imágenes.`); // Mostrar toast de error
            return;
        }

        // Validar tipo y tamaño de las imágenes 
        const imagenesValidas: File[] = []; // Array para almacenar imágenes válidas
        const imagenesPreviewNuevas: string[] = []; // Array para almacenar previews de imágenes nuevas

        archivos.forEach((archivo) => {

            // Validar tipo de archivo (debe ser una imagen)
            if (!archivo.type.startsWith('image/')) {
                this.noti.error('Tipo inválido', `El archivo ${archivo.name} no es una imagen válida.`); // Mostrar toast de error
                return;
            }

            // Validar tamaño del archivo
            const tamanoMB = archivo.size / (1024 * 1024);
            if (tamanoMB > this.maxTamanoImagenMB) {
                this.noti.error('Tamaño excedido', `El archivo ${archivo.name} excede el tamaño máximo de ${this.maxTamanoImagenMB} MB.`); // Mostrar toast de error
                return;
            }

            // Agregar imagen válida
            imagenesValidas.push(archivo);

            // Crear el preview del archivo/imagen
            const reader = new FileReader();

            reader.onload = (e) => {

                // Agregar el preview a la lista de previews nuevas
                imagenesPreviewNuevas.push(e.target?.result as string);

                // Actualizar la signal de previews con las nuevas imágenes
                // Copiar el array actual y agregar las nuevas previews
                this.imagenesPreview.set([...this.imagenesPreview(), ...imagenesPreviewNuevas]);
            };

            // Leer el archivo como Data URL para el preview
            reader.readAsDataURL(archivo);

        });

        // Actualizar la signal de imágenes seleccionadas
        this.imagenesSeleccionadas.set([...this.imagenesSeleccionadas(), ...imagenesValidas]);

        // Limpiar el input para permitir seleccionar el mismo archivo nuevamente si es necesario
        input.value = '';
    }

    /** 
     * Eliminar una imagen seleccionada por índice
     */
    removeImage(index: number): void {
        const imagenesActuales = this.imagenesSeleccionadas();
        const previews = this.imagenesPreview();

        // Eliminar la imagen y el preview en el índice especificado
        imagenesActuales.splice(index, 1);
        previews.splice(index, 1);

        // Actualizar las signals con los nuevos arrays
        this.imagenesSeleccionadas.set([...imagenesActuales]);
        this.imagenesPreview.set([...previews]);
    }

    /** 
     * Función para validar si se puede enviar el formulario 
     */
    puedeEnviar(): boolean {

        // Devolver el estado dependiendo del estado del form
        // seleccionada y que no se esté enviando ya el formulario
        return (
            this.estadoForm.valid &&
            // this.imagenesSeleccionadas().length > 0 &&
            !this.enviando()
        )
    }

    /**
     * Enviar cambio de estado del tiquete mediante una promesa
     */
    async onSubmit(): Promise<void> {
        if (!this.puedeEnviar()) {
            this.estadoForm.markAllAsTouched(); // Marcar todos los campos como tocados para mostrar errores
            this.noti.error('Formulario inválido', 'Complete todos los campos requeridos');
            return; 
        }
        this.enviando.set(true); // Indicar que se está enviando el formulario

            // // Revisar que haya al menos una imagen seleccionada
            // if (this.imagenesSeleccionadas().length == 0) {
            //     this.noti.error('Imagen requerida', 'Debe seleccionar al menos una imagen para adjuntar.');
            // }

            // // Si hay una imagen, pero otros campos están inválidos, enviar error
            // else {
            //     this.noti.error('Formulario inválido', 'Complete todos los campos requeridos');
            // }
            // return; // Salir del método si no se puede enviar
        

        // this.enviando.set(true); // Indicar que se está enviando el formulario

        try {

            // Subir las imágenes seleccionadas 
            // const imagenesSubidas = await this.subirImagenes();
            let imagenesSubidas: string[] = [];

            //Si no hay imágenes subidas, enviar excepción
            // if (!imagenesSubidas || imagenesSubidas.length === 0) {
            //     throw new Error('No se pudieron subir las imágenes.');
            // }

            // Enviar las imagenes para subir al servidor
            if (this.imagenesSeleccionadas().length > 0) {
                imagenesSubidas = await this.subirImagenes();
            }
            // Preparar el payload 
            const payload = {
                nuevoEstado: this.estadoForm.value.nuevoEstado,
                nota: this.estadoForm.value.nota,
                imagenes: imagenesSubidas, // URLs de las imágenes subidas (opcionales)
                usuarioAsignadoId: this.estadoForm.value.usuarioAsignadoId,
                usuarioActualId: this.data.usuarioLogueado?.id, 
                usuarioActualRol: this.data.usuarioLogueado?.rol
            };

            // usuarioAsignadoId se incluye solo si el usuario logueado es ADMIN
            if (this.esAdmin()) {
                //Obtener el usuarioAsignadoId del formulario
                const tecnicoId = this.estadoForm.get('usuarioAsignadoId')?.value;

                // Si existe el id de técnico, incluirlo en el payload
                if (tecnicoId){
                    payload.usuarioAsignadoId = tecnicoId; 
                }
            }

            console.log('[DIALOG] Payload para actualizar estado deltiquete:', payload);

            // Enviar la actualización del estado del tiquete al servicio 
            this.ticketService.updateEstado(this.data.ticket.id, payload).subscribe({
                next: (response) => {
                    console.log('[DIALOG] Estado del tiquete actualizado:', response);
                    this.noti.success('Éxito', 'El estado del tiquete se ha actualizado correctamente.', 3000);

                    // Cerrar el diálogo
                    this.dialogRef.close(true);
                },

                // Manejo de errores 
                error: (error) => {
                    console.error('[DIALOG] Error al actualizar el estado del tiquete:', error);
                    this.noti.error('Error', 'No se pudo actualizar el estado del tiquete. Intente nuevamente.');
                    this.enviando.set(false); // Permitir reintento de envío
                }
            });
        } catch (error) {
            console.error('[DIALOG] Excepción al enviar el formulario:', error);
            this.noti.error('Error', 'Ocurrió un error al procesar su solicitud. Intente nuevamente.');
            this.enviando.set(false); // Permitir reintento de envío
        }

    }

    /**
     * Subir las imágenes seleccionadas al servidor a través de una promesa
     */
    private async subirImagenes(): Promise<string[]> {

        // Obtener las imagenes seleccionadas
        const imagenes = this.imagenesSeleccionadas();

        // Declarar un arreglo de strings con las urls de las imágenes
        const imagenesSubidas: string[] = [];

        // Recorrer imagenes y subir cada una
        for (const imagen of imagenes) {
            try {
                const response = await this.uploadService.upload(imagen, null).toPromise(); 

                // Si la respuesta trae nombre de archivo, agregar el nombre al arreglo imagenesSubidas 
                if (response && response.fileName) {
                    imagenesSubidas.push(response.fileName);
                    console.log('[DIALOG] Imagen subida:', response.fileName);
                }
            }
            catch(error) {
                console.error('[DIALOG] Error al subir imagen:', error);
                // Lanzar error para manejarlo en el método que llama a esta función
                throw new Error(`Error al subir la imagen ${imagen.name}`);
            }
        }
        return imagenesSubidas;
    }

    /**
     * Al presionar botón cancelar, cerrar el dialog
     */
    onCancel(): void {
        this.dialogRef.close(false);
    }

    /**
     * Obtener la etiqueta legible del estado del tiquete
     */
    getEstadoLabel(estado: EstadoTicket): string {
        return this.estadoLabels[estado] || 'Desconocido'; // Valor por defecto si no se encuentra
    }

    /**
     * Obtener el ícono asociado al estado del tiquete
     */
    getEstadoIcon(estado: EstadoTicket): string {
        return this.estadoIcons[estado] || 'help_outline'; // Valor por defecto si no se encuentra
    }

   /**
    * Abrir el dialog de asignación manual de técnico
    */
//    abrirAsignacionManualDialog(): void {
//     //Método para abrir el diálogo de asignación manual de técnico
//     const dialogRef = this.dialog.open(AsignacionManualDialog, {
//         width: '600px', // Ancho del diálogo
//         maxHeight: '80vh', // Altura máxima del diálogo
//         disableClose: true, // No permitir cerrar haciendo clic fuera (valor "false" deja cerrarlo)
//         // Pasar datos al diálogo
//         data: {
//             tecnicos: this.tecnicos(),
//             ticketId: this.data.ticket.id
//         }
//     });

//     // Subscribirse al cierre del diálogo
//     dialogRef.afterClosed().subscribe(result => {
//         if (result === true) {
//             // Debuguear que el técnico fue asignado manualmente
//             console.log('[DIALOG] Técnico asignado manualmente al tiquete.', result);

//             // Actualizar el formulario de cambio de estado con el nuevo técnico asignado
//             this.estadoForm.patchValue({usuarioAsignadoId: result.usuarioAsignadoId});
//         }
//     });
//    }


}