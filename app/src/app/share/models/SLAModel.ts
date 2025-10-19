import { CategoriaModel } from "./CategoriaModel";

export interface SLAModel {
  id: number;
  nombre: string;
  maxMinutosRespuesta: number;
  maxMinutosResolucion: number;
  activo: boolean; // default true

  // Relaciones
  categorias?: CategoriaModel[]; // 1-M
}