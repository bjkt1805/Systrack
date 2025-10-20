import { AsignacionModel } from "./AsignacionModel";
import { CategoriaModel } from "./CategoriaModel";
import { EstadoTicket, Prioridad } from "./EnumsModel";
import { HistorialTicketModel } from "./HistorialTicketModel";
import { NotificacionModel } from "./NotificacionModel";
import { UsuarioModel } from "./UsuarioModel";
import { ValoracionServicioModel } from "./ValoracionServicioModel";

export interface TicketModel {
  id: number;
  codigo: string; // p.ej. "INC-2025-0001"
  titulo: string;
  descripcion: string;
  
  estado: EstadoTicket; // default PENDIENTE
  prioridad: Prioridad; // default MEDIA

  solicitanteId: number;
  categoriaId: number;
  usuarioAsignadoId?: number | null;

  // Deadlines persistidos (SLA)
  fechaLimiteRespuesta: Date;
  fechaLimiteResolucion: Date;

  // Acciones clave
  respondidoAt?: Date | null;
  resueltoAt?: Date | null;
  cerradoAt?: Date | null;
  cerradoPorId?: number | null;
  cumplioRespuesta?: boolean | null;
  cumplioResolucion?: boolean | null;

  creadoAt: Date;
  updatedAt: Date;

  // Relaciones
  solicitante: UsuarioModel;                 // M-1
  cerradoPor?: UsuarioModel | null;          // M-1
  categoria: CategoriaModel;                 // M-1
  usuarioAsignado?: UsuarioModel | null;     // M-1

  historiales?: HistorialTicketModel[];      // 1-M
  asignaciones?: AsignacionModel[];          // 1-M
  notificaciones?: NotificacionModel[];      // 1-M
  valoracion?: ValoracionServicioModel | null; // 1-1
}