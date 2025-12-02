import { PrismaClient, Prisma } from "../../generated/prisma";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";

export class NotificacionController {
  prisma = new PrismaClient();

  // Obtener todas las notificaciones por usuario (leídas y no leídas)
  getByUsuario = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      // Obtener el id del usuario como parámetro
      const usuarioId = parseInt(request.params.id, 10);

      // Select * from notificacion where receptorId = usuarioId
      const listado = await this.prisma.notificacion.findMany({
        // Ordenar por fecha de creación descendente (más recientes primero)
        orderBy: { creadoAt: "desc" },
        where: {
          receptorId: usuarioId,
          // SIN filtro de estado = trae TODAS (LEIDA y NO_LEIDA)
        },
      });

      response.json(listado);
    } catch (error) {
      next(error);
    }
  };

  // OBTENER TODAS LAS NOTIFICACIONES NO LÉIDAS
  // PARA EL USUARIO
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Obtener el id del usuario como parámetro
      const usuarioId = parseInt(request.params.id, 10);

      // Select * from notificacion where (receptorId = usuarioId) AND (estado = "NO_LEIDA");
      const listado = await this.prisma.notificacion.findMany({
        // Ordenar por fecha de creación descendente (más recientes primero)
        orderBy: { creadoAt: "desc" },

        where: {
          receptorId: usuarioId,
          estado: "NO_LEIDA",
        },
      });
      response.json(listado);
    } catch (error) {
      next(error);
    }
  };

  // ACTUALIZAR UNA NOTIFICACIÓN COMO LEÍDA
  actualizarNotificacion = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      // Obtener el id de la notificación desde los parámetros
      const notificacionId = parseInt(request.params.id, 10);

      // Actualizar el estado de la notificación a "LEIDA"
      const notificacionActualizada = await this.prisma.notificacion.update({
        where: { id: notificacionId },
        data: { estado: "LEIDA", leidoAt: new Date() }, // Cambiar estado y fecha de lectura
      });
      response.json(notificacionActualizada);
    } catch (error) {
      next(error);
    }
  };
}
