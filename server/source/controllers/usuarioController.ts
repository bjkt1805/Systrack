import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient, Rol, Usuario } from "../../generated/prisma";
import passport from "passport";
import { generateToken } from "../config/authUtils";
import { AppError } from "../errors/custom.error";

const prisma = new PrismaClient();

export class UsuarioController {

    prisma = new PrismaClient();

    // Crear usuario nuevo con contraseña encriptada (bcrypt.hash())
    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { nombreUsuario, nombreCompleto, telefono, correo, password, rol, foto } = req.body;

            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            const user = await prisma.usuario.create({
                data: {
                    nombreUsuario,
                    nombreCompleto,
                    telefono,
                    correo,
                    contrasenaHash: hash,
                    rol: Rol[rol as keyof typeof Rol],
                },
            });

            res.status(201).json({
                success: true,
                message: "Usuario creado",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    };

    login = (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate(
            "local",
            { session: false },
            (
                err: Error | null,
                user: Express.User | false | null,
                info: { message?: string }
            ) => {
                if (err) return next(err);
                if (!user) {
                    return res
                        .status(401)
                        .json({ success: false, message: info.message });
                }
                const token = generateToken(user as Usuario);
                return res.json({
                    success: true,
                    message: "Inicio de sesión exitoso",
                    token,
                });
            }
        )(req, res, next);
    };
    userAuth = (req: Request, res: Response, next: NextFunction) => {
        try {
            const usuario = req.user as Usuario;
            res.json(usuario);

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


}
