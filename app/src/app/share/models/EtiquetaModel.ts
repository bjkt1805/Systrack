import { CategoriaModel } from "./CategoriaModel";

export interface EtiquetaModel {
  id: number;
  nombre: string;

  // Relaciones
  categorias?: CategoriaModel[]; // M2M
}