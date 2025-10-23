import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class UsuarioController {
  prisma = new PrismaClient();

  //Listado de usuarios
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      //Select * from usuario
      const listado = await this.prisma.usuario.findMany({
        orderBy: {
          nombreCompleto: "asc",
        },
      });
      //Dar respuesta
      response.json(listado);
    } catch (error) {
      next(error);
    }
  };
}