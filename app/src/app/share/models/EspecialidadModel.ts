import { CategoriaModel } from "./CategoriaModel";
import { UsuarioModel } from "./UsuarioModel";

export interface EspecialidadModel {
  id: number;
  nombre: string;
  descripcion?: string | null;

  // Relaciones
  tecnicos?: UsuarioModel[];       // M2M
  categorias?: CategoriaModel[];   // M2M
}