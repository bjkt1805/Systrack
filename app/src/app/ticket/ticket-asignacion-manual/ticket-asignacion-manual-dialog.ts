import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TicketService } from '../../share/services/api/ticket.service';
import { TecnicoService } from '../../share/services/api/tecnico.service';
import { AsignacionService } from '../../share/services/api/asignacion.service';
import { firstValueFrom } from 'rxjs';

interface TecnicoDisponible {
  id: number;
  nombreCompleto: string;
  correo: string;
  especialidades: string[];
  cargaTrabajo: number;
  ticketsAsignados: number;
  estado: boolean;
}

interface TicketModel {
  id: number;
  codigo: string;
  titulo: string;
  categoria: {
    id: number;
    nombre: string;
    especialidades: { id: number; nombre: string }[];
    sla: {
      id: number;
      nombre: string;
      maxMinutosRespuesta: number;
      maxMinutosResolucion: number;
    };
  };
  prioridad: string;
}

@Component({
  selector: 'app-ticket-asignacion-manual-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './ticket-asignacion-manual-dialog.html',
  styleUrl: './ticket-asignacion-manual-dialog.css',
})
export class AsignacionManualDialog {
  private dialogRef = inject(MatDialogRef<AsignacionManualDialog>);
  private data = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  // Inyectar el servicio de tickets
  private ticketService = inject(TicketService);

  // Inyectar el servicio de asignación
  private asignacionService = inject(AsignacionService);

  //Inyectar el servicio de técnicos
  private tecnicoService = inject(TecnicoService);

  // Signals
  cargando = signal(true);
  procesando = signal(false);
  asignacionExitosa = signal(false);
  errorAsignacion = signal<string | null>(null);

  // Signal para almacenar los datos del ticket
  datos = signal<TicketModel | null>(null);
  tecnicos = signal<TecnicoDisponible[]>([]);
  tecnicosFiltrados = signal<TecnicoDisponible[]>([]);
  tecnicoSeleccionado = signal<TecnicoDisponible | null>(null);
  fechaAsignacion = signal<Date | null>(null);

  // Formulario
  asignacionForm: FormGroup;
  constructor() {
    this.asignacionForm = this.fb.group({
      tecnicoId: ['', Validators.required], // Lo crea vacio para que el usuario seleccione
      justificacion: ['', [Validators.required, Validators.minLength(5)]], // Vacio con un minimo de 5 caracteres
    });
    this.cargarDatos(); // llama a la función para cargar los datos del ticket
  }

  cargarDatos() {
    try {
      const ticketId = this.data.ticket?.id || this.data.ticketId; // Obtener el ID del ticket de los datos inyectados

      if (!ticketId) {
        throw new Error('No se proporcionó un ID de ticket válido');
      }

      // Usar ticketService.getById() para obtener el ticket completo y sus detalles
      this.ticketService.getById(ticketId).subscribe({
        next: (ticketCompleto) => {
          console.log('Ticket completo:', ticketCompleto);
          console.log('Categoria:', ticketCompleto.categoria);
          console.log('SLA:', ticketCompleto.categoria?.sla);

          if (ticketCompleto.estado !== 'PENDIENTE') {
            // Solo los pendientes pueden ser asignados
            this.errorAsignacion.set('Solo se pueden asignar tickets en estado PENDIENTE');
            this.cargando.set(false);
            return;
          }

          // Carga la información del ticket en el signal
          this.datos.set({
            id: ticketCompleto.id,
            codigo: ticketCompleto.codigo,
            titulo: ticketCompleto.titulo,
            categoria: {
              id: ticketCompleto.categoria.id,
              nombre: ticketCompleto.categoria.nombre,
              especialidades: ticketCompleto.categoria.especialidades || [],
              sla: {
                id: ticketCompleto.categoria.sla.id,
                nombre: ticketCompleto.categoria.sla.nombre,
                maxMinutosRespuesta: ticketCompleto.categoria.sla.maxMinutosRespuesta,
                maxMinutosResolucion: ticketCompleto.categoria.sla.maxMinutosResolucion,
              },
            },
            prioridad: ticketCompleto.prioridad,
          });

          this.cargarTecnicos(); // Cargar los técnicos disponibles
        },
        error: (error) => {
          console.error('Error al cargar ticket:', error);
          this.errorAsignacion.set(error.message || 'Error al cargar los datos del ticket');
          this.cargando.set(false);
        },
      });
    } catch (error: any) {
      console.error('Error en cargarDatos:', error);
      this.errorAsignacion.set(error.message || 'Error al cargar los datos');
      this.cargando.set(false);
    }
  }

  // Este viene siendo el metodo para cargar técnicos disponibles
  private cargarTecnicos() {
    this.tecnicoService.getAvailable().subscribe({
      next: (tecnicos) => {
        console.log('Técnicos disponibles:', tecnicos);

        // Mapear los datos de los técnicos al formato esperado
        const tecnicosData = tecnicos.map((t: any) => ({
          id: t.id,
          nombreCompleto: t.nombreCompleto,
          correo: t.correo,
          // Extraer solo los NOMBRES de las especialidades
          especialidades: Array.isArray(t.especialidades)
            ? t.especialidades.map((esp: any) => esp.nombre || esp)
            : [],
          cargaTrabajo: t.cargaTrabajo || 0,
          ticketsAsignados: t.ticketsAsignados || 0,
          estado: t.activo,
        }));

        console.log('Técnicos mapeados:', tecnicosData);

        this.tecnicos.set(tecnicosData);
        this.filtrarTecnicos();
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar técnicos:', error);
        this.errorAsignacion.set('Error al cargar la lista de técnicos disponibles');
        this.cargando.set(false);
      },
    });
  }

  filtrarTecnicos() {
    let filtrados = [...this.tecnicos()];

    console.log('=== FILTRADO DE TÉCNICOS ===');
    console.log('Categoría del ticket:', this.datos()?.categoria?.nombre);
    console.log('Especialidades de la categoría:', this.datos()?.categoria?.especialidades);
    console.log('Técnicos disponibles:', filtrados);

    // Solo técnicos que tengan al menos UNA especialidad de la categoría
    const especialidadesCategoria = this.datos()?.categoria?.especialidades || [];

    if (especialidadesCategoria.length > 0) {
      // Extraer solo los nombres de las especialidades de la categoría
      const nombresEspecialidades = especialidadesCategoria.map((e) => e.nombre);

      console.log('Nombres de especialidades requeridas:', nombresEspecialidades);

      filtrados = filtrados.filter((tecnico) => {
        // Verificar si el técnico tiene al menos una de las especialidades requeridas
        const tieneEspecialidad =
          Array.isArray(tecnico.especialidades) &&
          tecnico.especialidades.some((espTecnico) => nombresEspecialidades.includes(espTecnico));

        console.log(`Técnico ${tecnico.nombreCompleto}:`, {
          especialidades: tecnico.especialidades,
          cumple: tieneEspecialidad,
        });

        return tieneEspecialidad;
      });
    }

    console.log('Técnicos después del filtro:', filtrados);
    this.tecnicosFiltrados.set(filtrados);
  }

  onTecnicoSeleccionado(tecnicoId: number) {
    const tecnico = this.tecnicos().find((t) => t.id === tecnicoId);// Buscar el técnico seleccionado por su ID
    this.tecnicoSeleccionado.set(tecnico || null);// Actualizar el signal con el técnico seleccionado
  }

  async onAsignar() {
    if (!this.asignacionForm.valid) {
      this.asignacionForm.markAllAsTouched();// Marcar todos los campos como tocados para mostrar errores
      return;
    }

    this.procesando.set(true);// Indicar que se está procesando
    this.errorAsignacion.set(null);// Limpiar errores previos

    try {
      console.log('[ASIGNACION MANUAL] Enviando:', { // Log de los datos que se van a enviar
        ticketId: this.datos()?.id!,// ID del ticket
        tecnicoId: this.asignacionForm.value.tecnicoId,// ID del técnico
        justificacion: this.asignacionForm.value.justificacion,// Justificación de la asignación
      });

      // Pasar tres parámetros separados
      const response = await firstValueFrom(
        this.asignacionService.manualAsignarTicket(
          this.datos()?.id!, // ticketId
          this.asignacionForm.value.tecnicoId, // tecnicoId
          this.asignacionForm.value.justificacion // justificacion
        )
      );

      console.log('[ASIGNACION MANUAL] Respuesta:', response);

      this.fechaAsignacion.set(new Date());
      this.asignacionExitosa.set(true);
    } catch (error: any) {
      console.error('[ASIGNACION MANUAL] Error:', error);
      this.errorAsignacion.set(error.error?.message || 'Error al asignar el ticket.');
    } finally {
      this.procesando.set(false);
    }
  }

  onCancelar() {
    this.dialogRef.close(null);
  }

  onClose() {
    this.dialogRef.close({ success: true, tecnico: this.tecnicoSeleccionado() });
  }

  // Utilidades para clases CSS
  getPrioridadClass(prioridad: string | undefined): string {
    const classes: any = {
      BAJA: 'prioridad-baja',
      MEDIA: 'prioridad-media',
      ALTA: 'prioridad-alta',
      URGENTE: 'prioridad-urgente',
    };
    return classes[prioridad || ''] || '';
  }

  getCargaClass(carga: number): string {
    if (carga < 50) return 'carga-baja';
    if (carga < 75) return 'carga-media';
    return 'carga-alta';
  }
}
