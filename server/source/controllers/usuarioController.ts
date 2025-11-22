import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient, Rol, Usuario } from "../../generated/prisma";
import passport from "passport";
import { generateToken } from "../config/authUtils";
import { AppError } from "../errors/custom.error";

const prisma = new PrismaClient();

export class UsuarioController {

    prisma = new PrismaClient();

    /**
     * Crear usuario nuevo con contraseña encriptada (bcrypt.hash())
     * @param req 
     * @param res 
     * @param next 
     */
    register = async (req: Request, res: Response, next: NextFunction) => {
        try {

            // Extraer los datos del usuario desde el cuerpo de la solicitud
            const { nombreUsuario, nombreCompleto, telefono, correo, password, rol, foto } = req.body;

            // Generar un hash de la contraseña utilizando bcrypt
            const salt = await bcrypt.genSalt(10);

            // Encriptar la contraseña con el hash generado
            const hash = await bcrypt.hash(password, salt);

            // Crear el nuevo usuario en la base de datos con los datos proporcionados y la contraseña encriptada
            const user = await prisma.usuario.create({
                data: {
                    nombreUsuario,
                    nombreCompleto,
                    telefono,
                    correo,
                    contrasenaHash: hash, // Almacenar el hash de la contraseña en la BD
                    rol: Rol[rol as keyof typeof Rol], // Asegurarse de que el rol sea del tipo enum Rol
                },
            });

            // Responder con 201 con éxito de usuario creado
            res.status(201).json({
                success: true,
                message: "Usuario creado",
                data: user,
            });
        } catch (error: any) {

            // En este caso, al haber campos unique en usuario como 
            // nombreUsuario y correo, si se intenta crear un usuario con
            // un nombre o correo ya existente, Prisma lanzará un error de violación
            // Hay que capturarlo y devolver un error 400 (Bad Request). El código 
            // de error es P2002

            if (error.code === 'P2002') {

                // Obtener el campo que causó la violación de unicidad
                const campo = error.meta.target;

                // Crear un mensaje de error específico según el campo
                let mensaje = '';
                if (campo.includes('nombreUsuario')) {
                    mensaje = 'El nombre de usuario ya está en uso.';
                }
                else if (campo.includes('correo')) {
                    mensaje = 'El correo electrónico ya está registrado.';
                }

                // Retornar un error 400 (bad request al frontend)
                return res.status(400).json({
                    success: false,
                    message: mensaje,
                    campo
                });
            }

            next(error);
        }
    };


    /**
     * Método para manejar el inicio de sesión de usuarios utilizando Passport.js
     * @param req 
     * @param res 
     * @param next 
     */
    login = (req: Request, res: Response, next: NextFunction) => {

        // Utilizar la estrategia de autenticación "local" de Passport.js
        passport.authenticate(
            "local",
            { session: false }, // No utilizar sesiones, ya que se usará JWT
            (
                err: Error | null, // Tipo de error
                user: Express.User | false | null, // Usuario autenticado o false si falla
                info: { message?: string } // Información adicional sobre la autenticación
            ) => {
                if (err) return next(err); // Manejar errores de autenticación

                // Si no se encuentra el usuario, responder con error 401 (no autenticado)
                if (!user) {
                    return res
                        .status(401)
                        .json({ success: false, message: info.message });
                }

                // Si la autenticación es exitosa, generar un token JWT para el usuario
                const token = generateToken(user as Usuario);

                // Responder con el token JWT generado
                return res.json({
                    success: true,
                    message: "Inicio de sesión exitoso",
                    token,
                });
            }
        )(req, res, next);
    };

    /**
     * Método para devolver la información del usuario autenticado
     * @param req 
     * @param res 
     * @param next 
     */
    userAuth = (req: Request, res: Response, next: NextFunction) => {
        try {

            // Extraer el usuario autenticado del objeto de solicitud (establecido por Passport.js)
            const usuario = req.user as Usuario;

            // Responder con la información del usuario autenticado
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
