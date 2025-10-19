import { HistorialTicketModel } from "./HistorialTicketModel";

export interface ImagenTicketModel {
  id: number;
  historialId: number;
  url: string;
  descripcion?: string | null;

  creadoAt: Date;
  updatedAt: Date;

  // Relaciones
  historial: HistorialTicketModel; // M-1
}