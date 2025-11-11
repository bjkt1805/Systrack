import { PrismaClient } from "../../generated/prisma";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";

export class SLAController {
  prisma = new PrismaClient();

  // OBTENER TODOS LOS SLAs
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const slas = await this.prisma.sLA.findMany({
        where: {
          activo: true, // Solo SLAs activos
        },
        select: {
          id: true,
          nombre: true,
          maxMinutosRespuesta: true,
          maxMinutosResolucion: true,
          activo: true,
        },
        orderBy: {
          nombre: "asc",
        },
      });

      response.json(slas);
    } catch (error) {
      next(error);
    }
  };

  // OBTENER UN SLA POR ID
  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const id = parseInt(request.params.id, 10);

      if (isNaN(id)) {
        return next(AppError.badRequest("ID inválido"));
      }

      const sla = await this.prisma.sLA.findUnique({
        where: { id },
        select: {
          id: true,
          nombre: true,
          maxMinutosRespuesta: true,
          maxMinutosResolucion: true,
          activo: true,
        },
      });

      if (!sla) {
        return next(AppError.notFound("SLA no encontrado"));
      }

      response.json(sla);
    } catch (error) {
      next(error);
    }
  };
}