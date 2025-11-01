import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class UsuarioController {
    prisma = new PrismaClient();

    //LISTADO DE USUARIOS
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

    // OBTENER UN USUARIO A TRAVÉS DE SU ID
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
            const ticket = await this.prisma.usuario.findUnique({
                // Busca el ticket por su 'id'
                where: { id },
                select: {
                    id: true,
                    correo: true,
                    contrasenaHash: true,
                    rol: true,
                    foto: true,
                    ultimoIngresoAt: true,
                    activo: true,
                    estadoTecnico: true,
                    cargaTrabajo: true,
                    creadoAt: true,
                    updatedAt: true,
                    nombreUsuario: true,
                    nombreCompleto: true,
                    telefono: true,
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

    // CREAR UN USUARIO 
    create = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const body = request.body

            const newUsuario = await this.prisma.usuario.create({
                data: {
                    nombreUsuario: body.nombreUsuario,
                    nombreCompleto: body.nombreCompleto,
                    telefono: body.telefono,
                    correo: body.correo,
                    contrasenaHash: body.contrasenaHash,
                    rol: body.rol,
                    estadoTecnico: body.estadoTecnico,
                    cargaTrabajo: body.cargaTrabajo,
                    activo: body.activo,
                    foto: body.foto,
                    //especialidades:[{id: valor},{id: valor}]
                    especialidades: {
                        connect: body.especialidades,
                    },
                    // //plataformas:[{anno_lanzamiento: valor, plataformaId: valor}]
                    // plataformas: {
                    //     create: await Promise.all(
                    //         body.plataformas.map(async (plat: PlataformaVideojuego) => {
                    //             return {
                    //                 anno_lanzamiento: plat.anno_lanzamiento,
                    //                 plataforma: { connect: { id: plat.plataformaId } },
                    //             };
                    //         })
                    //     ),
                    // },
                },
            });
            response.status(201).json(newUsuario);
        } catch (error) {
            console.error("[BACKEND] Error creando usuario:", error);
            next(error);
        }
    };
}