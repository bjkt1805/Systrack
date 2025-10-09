import { PrismaClient, Rol, EstadoTecnico } from "../../generated/prisma";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";

export class UsuarioController {
    prisma = new PrismaClient();

    // OBTENER TODOS LOS USUARIOS (FILTRADOS POR ROL DE TÉCNICO)
    // TAMBIÉN SE INCLUYE PAGINACIÓN 
    get = async (request: Request, response: Response, next: NextFunction) => {
        try {

            // Parámetro de consulta
            const consulta = (request.query.consulta as string) ?? "";

            // Parámetro de paginación
            const pagina = Math.max(parseInt((request.query.pagina as string) ?? "1", 10), 1);

            // Parámetro de tamaño de página
            const tamanoPagina = Math.min(Math.max(parseInt((request.query.tamanoPagina as string) ?? "20", 10), 1), 100);

            // Estado del técnico
            const estado = request.query.estado as keyof typeof EstadoTecnico | undefined;

            // Construcción del where para traer el listado de técnicos
            const where = {
                // Solo técnicos
                rol: Rol.TECNICO,

                // Filtros opcionales
                ...(estado ? { estadoTecnico: EstadoTecnico[estado] } : {}),
                ...(consulta ? {

                    // Búsqueda por nombre o email
                    OR: [
                        { nombreUsuario: { contains: consulta } },
                        { correo: { contains: consulta } }
                    ]
                } : {})
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
                    estadoTecnico: true
                }
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
            response.json(listado)

        } catch (error) {
            next(error);
        }
    };

    // OBTENER UN USUARIO TÉCNICO A TRAVÉS DE SU ID
    getById = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
        } catch (error: any) {
            next(error)
        }
    };

    // BUSCAR USUARIO POR NOMBRE
        search = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            //Obtener el párametro
            const {termino}=request.query
            if(typeof termino !='string' || termino.trim()=== ""){
                next(AppError.badRequest("El criterio de búsqueda es requerido"))
            }
            const searchTerm: string=termino as string
            const objeto=await this.prisma.usuario.findMany({
                where:{ 
                    nombreUsuario:{
                        contains:searchTerm
                    }
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
            })
            if(objeto){
                response.status(200).json(objeto)
            }else{
                next(AppError.notFound("No existe el usuario"))
            }
        } catch (error: any) {

            next(error)
        }
    };


    //CREAR USUARIO
    create = async (request: Request, response: Response, next: NextFunction) => {
        try {
        } catch (error) {
            next(error);
        }
    };
    //Actualizar
    update = async (request: Request, response: Response, next: NextFunction) => {
        try {
        } catch (error) {
            next(error);
        }
    };
}