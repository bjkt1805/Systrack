import { EstadoTicket } from "./EnumsModel";
import { ImagenTicketModel } from "./ImagenTicketModel";
import { TicketModel } from "./TicketModel";
import { UsuarioModel } from "./UsuarioModel";

export interface HistorialTicketModel {
  id: number;
  ticketId: number;
  cambiadoPorId?: number;
  deEstado?: EstadoTicket | null;
  aEstado: EstadoTicket;
  nota?: string | null;

  creadoAt: Date;
  updatedAt: Date;

  // Relaciones
  ticket: TicketModel;                  // M-1
  cambiadoPor?: UsuarioModel;            // M-1
  imagenes?: ImagenTicketModel[];       // 1-M
}