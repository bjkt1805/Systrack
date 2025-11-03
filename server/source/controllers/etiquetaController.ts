import { PrismaClient } from "../../generated/prisma";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";

export class EtiquetaController {
    prisma = new PrismaClient();

/**
 * Obtener todas las etiquetas
 * @param request 
 * @param response 
 * @param next 
 */

  get = async (request: Request, response: Response, next: NextFunction) => {
    try {

      //Select * from etiqueta ordenado por id ascendente
      const listado = await this.prisma.etiqueta.findMany({
        // ordenar por id de forma ascendente
        orderBy: { id: "asc" },

        // select para traer campos específicos
        select: {
          id: true,
          nombre: true
        },
      });
      response.json(listado);
    } catch (error) {
      next(error);
    }
  };

    /**
     * Obtener todas las categorías asociadas a una etiqueta específica
     * GET /etiqueta/:id/categorias
     */
    getCategoriasByEtiquetaId = async (request: Request, response: Response, next: NextFunction) => {
        try {

            // Extraer el ID de la etiqueta desde los parámetros de la ruta
            const etiquetaId = parseInt(request.params.id, 10);

            // Validar que el ID es un número válido
            if (isNaN(etiquetaId)) {
                return next(AppError.badRequest("ID de etiqueta inválido"));
            }

            // Log para depuración
            console.log(`[BACKEND] Buscando categorías para etiqueta ID: ${etiquetaId}`);

            // Buscar la etiqueta y sus categorías asociadas en la base de datos
            const etiqueta = await this.prisma.etiqueta.findUnique({
                where: { id: etiquetaId },
                include: {
                    categorias: {
                        include: {
                            sla: true,
                            especialidades: true
                        }
                    }
                }
            });

            // Manejar el caso donde la etiqueta no existe
            if (!etiqueta) {
                return next(AppError.notFound("Etiqueta no encontrada"));
            }

            // Manejar el caso donde la etiqueta no tiene categorias asociadas o la lista de categorias es 0.
            if (!etiqueta.categorias || etiqueta.categorias.length === 0) {
                return next(AppError.notFound("No hay categorías asociadas a esta etiqueta"));
            }

            // Log para depurar la cantidad de categorías asociadas a una etiqueta
            console.log(`[BACKEND] ${etiqueta.categorias.length} categorías encontradas`);

            // Responder con la primera categoría ya que viene en un arreglo
            response.json(etiqueta.categorias[0]);

        } catch (error) {

            // Mostrar error en consola
            console.error("[BACKEND] Error obteniendo categorías por etiqueta:", error);
            next(error);
        }
    };
}