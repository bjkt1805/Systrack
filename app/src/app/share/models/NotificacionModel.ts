import { EstadoNotificacion, TipoNotificacion } from "./EnumsModel";
import { TicketModel } from "./TicketModel";
import { UsuarioModel } from "./UsuarioModel";

export interface NotificacionModel {
  id: number;
  tipo: TipoNotificacion;
  emisorId?: number | null;
  receptorId: number;
  ticketId?: number | null;
  estado: EstadoNotificacion; // default PENDIENTE
  mensaje?: string | null;
  creadoAt: Date;
  leidoAt?: Date | null;
  atendidoAt?: Date | null;
  updatedAt: Date;

  // Relaciones
  emisor?: UsuarioModel | null;   // M-1
  receptor: UsuarioModel;         // M-1
  ticket?: TicketModel | null;    // M-1 (opcional)
}