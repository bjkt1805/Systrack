import { MetodoAsignacion } from "./EnumsModel";
import { ReglaModel } from "./ReglaModel";
import { TicketModel } from "./TicketModel";
import { UsuarioModel } from "./UsuarioModel";

export interface AsignacionModel {
  ticketId: number;
  usuarioTecnicoId: number;
  metodo: MetodoAsignacion;
  motivo?: string | null;
  puntajePrioridad?: number | null;
  slaRestanteMin?: number | null;
  reglaId?: number | null;
  creadoAt: Date;
  updatedAt: Date;

  // Relaciones
  ticket: TicketModel;              // M-1
  usuario: UsuarioModel;            // M-1 (técnico)
  regla?: ReglaModel | null;        // M-1
}