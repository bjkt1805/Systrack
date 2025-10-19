import { TicketModel } from "./TicketModel";
import { UsuarioModel } from "./UsuarioModel";

export interface ValoracionServicioModel {
  id: number;
  ticketId: number;   // unique
  puntaje: number;    // 1..5 (validado en backend)
  comentario?: string | null;
  creadoPorId: number;
  creadoAt: Date;
  updatedAt: Date;

  // Relaciones
  ticket: TicketModel;     // 1-1
  creadoPor: UsuarioModel; // M-1
}