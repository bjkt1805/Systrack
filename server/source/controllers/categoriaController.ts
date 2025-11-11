import { PrismaClient} from "../../generated/prisma";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";

export class CategoriaController {
  prisma = new PrismaClient();

  // OBTENER TODAS LAS CATEGORIAS
  // TAMBIÉN SE INCLUYE PAGINACIÓN
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Parámetro de consulta
      const consulta = (request.query.consulta as string) ?? "";

      // Parámetro de paginación
      const pagina = Math.max(
        parseInt((request.query.pagina as string) ?? "1", 10),
        1
      );

      // Parámetro de tamaño de página
      const tamanoPagina = Math.min(
        Math.max(
          parseInt((request.query.tamanoPagina as string) ?? "20", 10),
          1
        ),
        100
      );

      // Construcción del where para traer el listado de categorias
      const where = {
        // Si existe el parámetro 'consulta', agrega un filtro OR
        ...(consulta
          ? {
              // El filtro OR busca coincidencias en 'nombre' o 'descripcion'
              OR: [
                // Coincidencia parcial en el campo 'nombre'
                { nombre: { contains: consulta } },
                // Coincidencia parcial en el campo 'descripcion'
                { descripcion: { contains: consulta } },
              ],
            }
          : // Si no hay consulta, no se agrega ningún filtro
            {}),
      };

      //Select * from categoria where (nombre like '%consulta%' OR descripcion like '%consulta%') = order by descripcion asc limit 20 offset 0;
      const listado = await this.prisma.categoria.findMany({
        // incluir el where construido arriba
        where,

        // ordenar por descripcion de forma ascendente
        orderBy: { descripcion: "asc" },

        // skip y take para paginación
        // skip: (pagina - 1) * tamanoPagina,
        // take: tamanoPagina,

        // Select específico de campos a retornar (incluye el SLA relacionado)
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          sla: {
            select: {
              id: true,
              nombre: true,
              maxMinutosRespuesta: true,
              maxMinutosResolucion: true,
            },
          },
        },

      });
      response.json(listado);
    } catch (error) {
      next(error);
    }
  };

  // OBTENER UNA CATEGORIA A TRAVÉS DE SU ID
  getById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      // Obtiene el parámetro 'id' de la URL y lo convierte a número
      const id = parseInt(request.params.id, 10);

      // Valida que el 'id' sea un número válido
      if (isNaN(id)) {
        // Si no es válido, responde con error de solicitud incorrecta
        return next(AppError.badRequest("ID inválido"));
      }

      // Busca la categoría por su 'id' en la BD
      const categoria = await this.prisma.categoria.findUnique({
        where: { id }, // Filtro por id
        include: {
          etiquetas: { orderBy: { id: "asc" } }, // Incluye la lista de etiquetas asociadas (ordenadas por id ascendente)
          especialidades: true, // Incluye la lista de especialidades asociadas
          sla: {
            // Incluye información del SLA relacionado
            select: {
              id: true, // ID del SLA
              nombre: true, // Nombre del SLA
              maxMinutosRespuesta: true, // Tiempo máximo de respuesta
              maxMinutosResolucion: true, // Tiempo máximo de resolución
            },
          },
        },
      });

      // Si se encuentra, responde con toda la información de la categoría
      response.json(categoria);

      // Si no se encuentra la categoría, responde con error 404
      if (!categoria) {
        return next(AppError.notFound("Categoría no encontrada"));
      }

    } catch (error: any) {
      next(error);
    }
  };

  // BUSCAR CATEGORIA POR NOMBRE
  search = async (request: Request, response: Response, next: NextFunction) => {
    try {
      //Obtener el párametro
      const { termino } = request.query;
      if (typeof termino != "string" || termino.trim() === "") {
        next(AppError.badRequest("El criterio de búsqueda es requerido"));
      }
      const searchTerm: string = termino as string;
      const objeto = await this.prisma.categoria.findMany({
        where: {
          nombre: {
            contains: searchTerm,
          },
        },
        // include:{
        //     generos:true,
        //     plataformas: {
        //         select:{
        //             plataforma:true,
        //             anno_lanzamiento:true
        //         }
        //     }
        // }
      });
      if (objeto) {
        response.status(200).json(objeto);
      } else {
        next(AppError.notFound("No existe la categoría"));
      }
    } catch (error: any) {
      next(error);
    }
  };

//CREAR CATEGORIA
create = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const body = request.body;
    
    const newCategoria = await this.prisma.categoria.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        slaId: body.sla?.id,
        especialidades: {
          connect: body.especialidades,
        },
        etiquetas: {
          connect: body.etiquetas,
        },
      },
    });
    
    response.status(201).json(newCategoria);
  } catch (error) {
    console.error("[BACKEND] Error creando categoría:", error);
    next(error);
  }
};

//ACTUALIZAR CATEGORIA
update = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const body = request.body;
    const idCategoria = parseInt(request.params.id);

      //Obtener categoría anterior
      const categoriaExistente = await this.prisma.categoria.findUnique({
        where: { id: idCategoria },
        include: {
          especialidades: {
            select: {
              id: true,
            },
          },
          etiquetas: {
            select: {
              id: true,
            },
          },
          sla: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!categoriaExistente) {
        response
          .status(404)
          .json({ message: "La categoría no existe" });
        return
      }

      // Desconectar especialidades antiguas y conectar las nuevas
      const disconnectEspecialidades = categoriaExistente.especialidades.map(
        (especialidad: { id: number }) => ({ id: especialidad.id })
      );
      const connectEspecialidades = body.especialidades
        ? body.especialidades.map((especialidad: { id: number }) => ({ id: especialidad.id }))
        : [];


      // Desconectar etiquetas antiguas y conectar las nuevas
      const disconnectEtiquetas = categoriaExistente.etiquetas.map(
        (etiqueta: { id: number }) => ({ id: etiqueta.id })
      );
      const connectEtiquetas = body.etiquetas
        ? body.etiquetas.map((etiqueta: { id: number }) => ({ id: etiqueta.id }))
        : [];



      //Actualizar
      const updateCategoria = await this.prisma.categoria.update({
        where: {
          id: idCategoria,
        },
        data: {
          nombre: body.nombre,
          descripcion: body.descripcion,
          slaId: body.sla?.id,
          especialidades: {
            disconnect: disconnectEspecialidades,
            connect: connectEspecialidades,
          },
          etiquetas: {
            disconnect: disconnectEtiquetas,
            connect: connectEtiquetas,
          },

        },
      });

      response.json(updateCategoria);
    } catch (error) {
      console.error("[BACKEND] Error creando categoría:", error);
      next(error);
    }
  };
}