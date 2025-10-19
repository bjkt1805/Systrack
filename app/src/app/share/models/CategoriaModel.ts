import { EspecialidadModel } from "./EspecialidadModel";
import { EtiquetaModel } from "./EtiquetaModel";
import { SLAModel } from "./SLAModel";
import { TicketModel } from "./TicketModel";

export interface CategoriaModel {
  id: number;
  nombre: string;
  descripcion?: string | null;
  slaId: number;

  creadoAt: Date;
  updatedAt: Date;

  // Relaciones
  sla: SLAModel;                        // M-1
  etiquetas?: EtiquetaModel[];          // M2M
  especialidades?: EspecialidadModel[]; // M2M
  tickets?: TicketModel[];              // 1-M
}