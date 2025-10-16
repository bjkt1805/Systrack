import { PrismaClient, EstadoTicket, Prioridad } from "../../generated/prisma";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";

export class TicketController {
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

      // Construcción del where para traer el listado de tickets
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

      //Select * from ticket where (nombre like '%consulta%' OR descripcion like '%consulta%') = order by descripcion asc limit 20 offset 0;
      const listado = await this.prisma.ticket.findMany({
        // incluir el where construido arriba
        where,

        // ordenar por id de forma ascendente
        orderBy: { id: "asc" },

        // select para traer máximo 4 campos
        select: {
          id: true,
          titulo: true,
          descripcion: true,
          estado: true,
          prioridad: true,
        },
      });
      response.json(listado);
    } catch (error) {
      next(error);
    }
  };

  // OBTENER UNA TICKET A TRAVÉS DE SU ID
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
      const ticket = await this.prisma.ticket.findUnique({
        // Busca el ticket por su 'id'
        where: { id },
        select: {
          id: true,
          codigo: true,
          titulo: true,
          descripcion: true,
          estado: true,
          prioridad: true,
          solicitante: true,
          categoria: true,
          usuarioAsignado: true,
          fechaLimiteRespuesta: true,
          fechaLimiteResolucion: true,
          respondidoAt : true,
          resueltoAt : true,
          cerradoAt : true,
          cumplioRespuesta : true,
          cumplioResolucion : true,
          // Incluye el historial de estados, observaciones y evidencias del ticket
          historiales: true,
          // Incluye la valoración del ticket (puntaje y comentario)
          valoracion: true,
        },
      });

      // Si se encuentra, responde con toda la información del ticket
      response.json(ticket);

      // Si no se encuentra el tiquete, responde con error 404
      if (!ticket) {
        return next(AppError.notFound("Tiquete no encontrado"));
      }
    } catch (error: any) {
      next(error);
    }
  };

  // BUSCAR TICKET POR ROL DE USUARIO
  search = async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Obtiene los parámetros de búsqueda y usuario desde la query
      const { termino, userId, userRol } = request.query;

      // Valida que el término de búsqueda sea un string no vacío
      if (typeof termino !== "string" || termino.trim() === "") {
        return next(
          AppError.badRequest("El criterio de búsqueda es requerido")
        );
      }

      // Valida que existan los datos de usuario y rol
      if (!userId || !userRol) {
        return next(AppError.badRequest("Faltan datos de usuario"));
      }

      // Construye el filtro base para buscar por título
      let where: any = {
        titulo: { contains: termino as string },
      };

      // Filtra los tickets según el rol del usuario
      if (userRol === "ADMINISTRADOR") {
        // Administrador: no se agrega filtro extra, ve todos los tickets
      } else if (userRol === "CLIENTE") {
        // Cliente: solo ve los tickets que él mismo registró
        where.solicitanteId = parseInt(userId as string, 10);
      } else if (userRol === "TECNICO") {
        // Técnico: solo ve los tickets asignados a él
        where.usuarioAsignadoId = parseInt(userId as string, 10);
      }

      // Busca los tickets en la base de datos según el filtro construido
      const tickets = await this.prisma.ticket.findMany({ where });

      // Si hay resultados, responde con el listado de tickets
      if (tickets.length > 0) {
        response.status(200).json(tickets);
      } else {
        // Si no hay resultados, responde con error de no encontrado
        next(AppError.notFound("No existen tickets para el criterio y rol"));
      }
    } catch (error: any) {
      // Si ocurre un error, lo pasa al manejador de errores
      next(error);
    }
  };

  //CREAR TICKET
  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
    } catch (error) {
      next(error);
    }
  };

  //ACTUALIZAR TICKET
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
    } catch (error) {
      next(error);
    }
  };
}