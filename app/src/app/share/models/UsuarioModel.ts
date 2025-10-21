import { AsignacionModel } from "./AsignacionModel";
import { Rol, EstadoTecnico } from "./EnumsModel";
import { EspecialidadModel } from "./EspecialidadModel";
import { HistorialTicketModel } from "./HistorialTicketModel";
import { NotificacionModel } from "./NotificacionModel";
import { TicketModel } from "./TicketModel";
import { ValoracionServicioModel } from "./ValoracionServicioModel";

export interface UsuarioModel {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  telefono?: string | null;
  correo: string;
  contrasenaHash: string;
  rol: Rol; // default CLIENTE en backend
  ultimoIngresoAt?: Date | null;
  activo: boolean; // default true

  // Campos "técnico"
  estadoTecnico?: EstadoTecnico | null;
  cargaTrabajo?: number | null; // default 0 en backend

  creadoAt: Date;
  updatedAt: Date;

  // Relaciones
  especialidades?: EspecialidadModel[]; // M2M
  tickets?: TicketModel[];              // como solicitante
  ticketsCerrados?: TicketModel[];      // como cerradoPor
  ticketsAsignados?: TicketModel[];     // como usuarioAsignado (técnico)
  historiales?: HistorialTicketModel[]; // cambios hechos
  notifsEnviadas?: NotificacionModel[];
  notifsRecibidas?: NotificacionModel[];
  valoraciones?: ValoracionServicioModel[];
  asignaciones?: AsignacionModel[];
}