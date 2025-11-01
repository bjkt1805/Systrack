import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class EspecialidadController {
    prisma = new PrismaClient();

    //LISTADO DE ESPECIALIDADES
    get = async (request: Request, response: Response, next: NextFunction) => {
        try {
            //Select * from especialidad
            const listado = await this.prisma.especialidad.findMany();
            //Dar respuesta
            response.json(listado);
        } catch (error) {
            next(error);
        }
    };
}