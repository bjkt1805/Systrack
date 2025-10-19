import { AsignacionModel } from "./AsignacionModel";

export interface ReglaModel {
  id: number;
  nombre: string;
  activa: boolean;
  eliminadaAt?: Date | null;

  // Pesos o criterios
  pesoPrioridad?: number | null;
  pesoSlaRestante?: number | null;
  pesoCargaTrabajo?: number | null;

  updatedAt: Date;

  // Relaciones
  asignaciones?: AsignacionModel[]; // 1-M
}