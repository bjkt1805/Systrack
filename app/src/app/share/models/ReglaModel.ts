import { AsignacionModel } from "./AsignacionModel";
import { CategoriaModel } from "./CategoriaModel";
import { Prioridad } from "./EnumsModel";
import { EspecialidadModel } from "./EspecialidadModel";

export interface ReglaModel {
  id: number;
  nombre: string;
  activa: boolean;

  // Filtros para aplicar la regla
  categoriaId: number;
  prioridad?: Prioridad | null;
  especialidadId: number;
  aplicaATodasPrioridades: boolean;

  // Peso o límite de carga (cant Tiquetes del técnico)
  pesoCargaTrabajo?: number | null;

  // Orden de prioridad de regla
  ordenPrioridad: number;

  creadoAt: Date;
  updatedAt: Date;

  // Relaciones
  categoria?: CategoriaModel;    // M-1
  especialidad?: EspecialidadModel // M-1
  asignaciones?: AsignacionModel[]; // 1-M
}