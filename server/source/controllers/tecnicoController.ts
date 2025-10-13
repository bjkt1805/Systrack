import { PrismaClient, Rol, EstadoTecnico } from "../../generated/prisma";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";

export class TecnicoController {
  prisma = new PrismaClient();

  // OBTENER TODOS LOS TÉCNICOS (FILTRADOS POR ROL DE TÉCNICO)
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

      // Estado del técnico
      const estado = request.query.estado as
        | keyof typeof EstadoTecnico
        | undefined;

      // Construcción del where para traer el listado de técnicos
      const where = {
        // Solo técnicos
        rol: Rol.TECNICO,

        // Filtros opcionales
        ...(estado ? { estadoTecnico: EstadoTecnico[estado] } : {}),
        ...(consulta
          ? {
              // Búsqueda por nombre o email
              OR: [
                { nombreUsuario: { contains: consulta } },
                { correo: { contains: consulta } },
              ],
            }
          : {}),
      };

      //Select * from usuario where rol = 'TECNICO' AND (nombreUsuario like '%consulta%' OR correo like '%consulta%') AND estadoTecnico = 'DISPONIBLE' order by correo asc limit 20 offset 0;
      const listado = await this.prisma.usuario.findMany({
        // incluir el where construido arriba
        where,

        // ordenar por correo de forma ascendente
        orderBy: { correo: "asc" },

        // skip y take para paginación
        // skip: (pagina - 1) * tamanoPagina,
        // take: tamanoPagina,

        // select para traer máximo 3 campos
        select: {
          // id: true,
          nombreUsuario: true,
          correo: true,
          estadoTecnico: true,
        },
      });

      // Contar el total de técnicos que cumplen el where
      // Select count(*) from usuario where rol = 'TECNICO' AND (nombreUsuario like '%consulta%' OR correo like '%consulta%') AND estadoTecnico = 'DISPONIBLE';
      // const total: number = await this.prisma.usuario.count({ where });

      // Devolver resultados y datos de paginación
      // response.json({
      //     datos: listado,
      //     pagina,
      //     tamanoPagina,
      //     total,
      //     totalPaginas: Math.ceil(total / tamanoPagina)
      // });

      // Devolver listado de técnicos
      response.json(listado);
    } catch (error) {
      next(error);
    }
  };

  // OBTENER UN TÉCNICO A TRAVÉS DE SU ID
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

      // Busca el técnico por su 'id' en la DB
      const tecnico = await this.prisma.usuario.findUnique({
        where: { id }, // Filtro por id
        include: {
          especialidades: true, // Incluye la lista de especialidades asociadas
          asignaciones: true, // Incluye la lista de asignaciones/tickets
        },
      });

      // Si no se encuentra el técnico, responde con error 404
      if (!tecnico) {
        return next(AppError.notFound("Técnico no encontrado"));
      }

      // Calcula la carga de trabajo (cantidad de asignaciones)
      const cargaTrabajo = tecnico.asignaciones
        ? tecnico.asignaciones.length
        : 0;

      // Determina si el técnico está disponible
      const disponible = tecnico.estadoTecnico === "DISPONIBLE";

      // Responde con la información detallada del técnico
      response.json({
        id: tecnico.id,
        nombreUsuario: tecnico.nombreUsuario,
        correo: tecnico.correo,
        estadoTecnico: tecnico.estadoTecnico,
        especialidades: tecnico.especialidades,
        cargaTrabajo,
        disponible,
      });
    } catch (error: any) {
      next(error);
    }
  };

  // BUSCAR TÉCNICO POR NOMBRE
  search = async (request: Request, response: Response, next: NextFunction) => {
    try {
      //Obtener el párametro
      const { termino } = request.query;
      if (typeof termino != "string" || termino.trim() === "") {
        next(AppError.badRequest("El criterio de búsqueda es requerido"));
      }
      const searchTerm: string = termino as string;
      const objeto = await this.prisma.usuario.findMany({
        where: {
          nombreUsuario: {
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
        next(AppError.notFound("No existe el usuario"));
      }
    } catch (error: any) {
      next(error);
    }
  };

  //CREAR TÉCNICO
  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
    } catch (error) {
      next(error);
    }
  };

  //ACTUALIZAR TÉCNICO
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
    } catch (error) {
      next(error);
    }
  };
}