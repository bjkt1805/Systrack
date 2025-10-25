import { PrismaClient, EstadoTicket, Prioridad, Prisma } from "../../generated/prisma";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";

export class TicketController {
  prisma = new PrismaClient();

  // OBTENER TODOS LOS TICKETS
  // TAMBIÉN SE INCLUYE PAGINACIÓN
  get = async (request: Request, response: Response, next: NextFunction) => {
    try {

      //Select * from ticket where (nombre like '%consulta%' OR descripcion like '%consulta%') = order by descripcion asc limit 20 offset 0;
      const listado = await this.prisma.ticket.findMany({
        // ordenar por id de forma ascendente
        orderBy: { id: "asc" },

        // select para traer campos específicos
        select: {
          id: true,
          codigo: true,
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

  // OBTENER TODOS LOS TICKETS PARA MOSTRAR EN EL TABLERO KANBAN
  // FILTRADO POR SEMANA ACTUAL O ESPECIFICADA
  getKanban = async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Parámetros de consulta opcionales para filtrar por semana
      const { semana } = request.query;

      console.log(`[BACKEND] Parámetro semana recibido: `, semana);

      // Calcular rango de fechas para la semana
      let fechaInicio: Date;
      let fechaFin: Date;

      if (semana) {
        // Si se proporciona una fecha específica, CALCULAR LA SEMANA de esa fecha
        const fechaBase = new Date(semana as string);

        fechaInicio = this.obtenerInicioSemana(fechaBase);
        fechaFin = this.obtenerFinSemana(fechaBase);

        console.log(`[BACKEND] Fecha de inicio calculada: ${fechaInicio.toISOString()}`);
        console.log(`[BACKEND] Fecha de fin calculada: ${fechaFin.toISOString()}`);

      } else {
        // Por defecto, usar la semana actual
        const hoy = new Date();
        fechaInicio = this.obtenerInicioSemana(hoy);
        fechaFin = this.obtenerFinSemana(hoy);
      }

      console.log(`Filtrando tickets de la semana: ${fechaInicio.toISOString()} a ${fechaFin.toISOString()}`);

      // Construir filtro de fecha
      const whereClause: Prisma.TicketWhereInput = {
        creadoAt: {
          gte: fechaInicio,  // Mayor o igual a lunes 00:00:00
          lte: fechaFin      // Menor o igual a domingo 23:59:59
        }
      };

      const listado = await this.prisma.ticket.findMany({
        where: whereClause,
        orderBy: { creadoAt: "asc" }, // Ordenar por fecha de creación
        select: {
          id: true,
          codigo: true,
          titulo: true,
          descripcion: true,
          estado: true,
          prioridad: true,
          creadoAt: true,
          categoriaId: true,
          fechaLimiteRespuesta: true,
          fechaLimiteResolucion: true,
          categoria: {
            select: {
              id: true,
              nombre: true,
              sla: {
                select: {
                  id: true,
                  nombre: true,
                  maxMinutosRespuesta: true,
                  maxMinutosResolucion: true,
                }
              }
            }
          }
        },
      });

      console.log(`Total de tickets en la semana: ${listado.length}`);

      // Respuesta con información adicional
      response.json({
        tickets: listado,
        semana: {
          inicio: fechaInicio.toISOString(),
          fin: fechaFin.toISOString(),
        },
        total: listado.length
      });

    } catch (error) {
      console.error('Error en método getKanban():', error);
      next(error);
    }
  };

  // OBTENER TICKETS ASIGNADOS A UN USUARIO
  getTicketsByUsuario = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {

      // Parámetro de ruta (ID de usuario)
      const { id } = request.params;

      // Parámetros de consulta (rol, página, límite)
      const { rol, pagina = "1", limite = "20" } = request.query;

      // Parsear los parámetros de ruta y consulta
      const usuarioId = parseInt(id);
      const paginaNum = parseInt(pagina as string);
      const limiteNum = parseInt(limite as string);

      // Calcular el offset (desplazamiento) para la paginación
      const skip = (paginaNum - 1) * limiteNum;

      // Validar que el ID de usuario sea un número válido
      if (isNaN(usuarioId)) {
        return next(AppError.badRequest("ID de usuario inválido"));
      }

      // Construir filtro según el rol
      // usando una variable whereClause de tipo Prisma.TicketWhereInput
      let whereClause: Prisma.TicketWhereInput = {};

      // Si el cliente tiene el rol CLIENTE, configurar el whereClause para utilizar 
      // el solicitanteId como filtro
      if (rol === 'CLIENTE') {

        // Cliente: solo tickets creados por él
        whereClause.solicitanteId = usuarioId;

        // Si el cliente tiene el rol TÉCNICO, configurar el whereClause para utilizar
        // el usuarioAsignadoId como filtro
      } else if (rol === 'TECNICO') {

        // Técnico: solo tickets asignados a él
        whereClause.usuarioAsignadoId = usuarioId;
      }
      // ADMINISTRADOR: sin filtro (todos los tickets)

      // Obtener tickets con paginación
      const [tickets, total] = await Promise.all([
        this.prisma.ticket.findMany({
          where: whereClause,
          skip: skip,
          take: limiteNum,
          orderBy: {
            creadoAt: "desc",
          },

          // Incluir en la respuesta los datos básicos del solicitante y del usuario asignado
          include: {
            solicitante: {
              select: {
                id: true,
                nombreUsuario: true,
                nombreCompleto: true,
              }
            },
            usuarioAsignado: {
              select: {
                id: true,
                nombreUsuario: true,
                nombreCompleto: true,
              }
            }
          }
        }),

        // Contar total de tickets para paginación
        // Select count(*) from ticket where ...
        // e incluir la clausula whereClause que contiene 
        // el filtro por solicitanteId o usuarioAsignadoId según el rol
        this.prisma.ticket.count({
          where: whereClause,
        })
      ]);

      // Respuesta con formato esperado por el frontend
      response.json({
        tickets,
        total,
        pagina: paginaNum,
        porPagina: limiteNum
      });
    } catch (error) {
      next(error);
    }
  };

  // OBTENER UN TICKET A TRAVÉS DE SU ID
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
          creadoAt: true,
          estado: true,
          prioridad: true,
          solicitante: true,
          categoria: {
            select: {
              id: true,
              nombre: true,
              sla: true,
            },
          },
          usuarioAsignado: true,
          fechaLimiteRespuesta: true,
          fechaLimiteResolucion: true,
          respondidoAt: true,
          resueltoAt: true,
          cerradoAt: true,
          cumplioRespuesta: true,
          cumplioResolucion: true,
          // Incluye el historial de estados, observaciones y evidencias del ticket
          historiales: {
            select: {
              id: true,
              creadoAt: true,
              cambiadoPor: true,
              deEstado: true,
              aEstado: true,
              nota: true,
              imagenes: true
            }
          },

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
  // search = async (request: Request, response: Response, next: NextFunction) => {
  //   try {
  //     // Obtiene los parámetros de búsqueda y usuario desde la query
  //     const { termino, userId, userRol } = request.query;

  //     // Valida que el término de búsqueda sea un string no vacío
  //     if (typeof termino !== "string" || termino.trim() === "") {
  //       return next(
  //         AppError.badRequest("El criterio de búsqueda es requerido")
  //       );
  //     }

  //     // Valida que existan los datos de usuario y rol
  //     if (!userId || !userRol) {
  //       return next(AppError.badRequest("Faltan datos de usuario"));
  //     }

  //     // Construye el filtro base para buscar por título
  //     let where: any = {
  //       titulo: { contains: termino as string },
  //     };

  //     // Filtra los tickets según el rol del usuario
  //     if (userRol === "ADMINISTRADOR") {
  //       // Administrador: no se agrega filtro extra, ve todos los tickets
  //     } else if (userRol === "CLIENTE") {
  //       // Cliente: solo ve los tickets que él mismo registró
  //       where.solicitanteId = parseInt(userId as string, 10);
  //     } else if (userRol === "TECNICO") {
  //       // Técnico: solo ve los tickets asignados a él
  //       where.usuarioAsignadoId = parseInt(userId as string, 10);
  //     }

  //     // Busca los tickets en la base de datos según el filtro construido
  //     const tickets = await this.prisma.ticket.findMany({ where });

  //     // Si hay resultados, responde con el listado de tickets
  //     if (tickets.length > 0) {
  //       response.status(200).json(tickets);
  //     } else {
  //       // Si no hay resultados, responde con error de no encontrado
  //       next(AppError.notFound("No existen tickets para el criterio y rol"));
  //     }
  //   } catch (error: any) {
  //     // Si ocurre un error, lo pasa al manejador de errores
  //     next(error);
  //   }
  // };

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

// MÉTODOS PARA CÁLCULO DE SEMANA
private obtenerInicioSemana(fecha: Date): Date {

  // TRABAJAR en UTC para evitar conversiones de zona horaria
  const año = fecha.getUTCFullYear();
  const mes = fecha.getUTCMonth();
  const dia = fecha.getUTCDate();

  // CREAR fecha UTC explícita
  const fechaUTC = new Date(Date.UTC(año, mes, dia, 0, 0, 0, 0));

  console.log('[BACKEND] === DEBUG INICIO SEMANA ===');
  console.log('[BACKEND] Fecha original:', fecha.toISOString());
  console.log('[BACKEND] Fecha UTC creada:', fechaUTC.toISOString());
  console.log('[BACKEND] getUTCDay():', fechaUTC.getUTCDay());
  console.log('[BACKEND] getUTCDate():', fechaUTC.getUTCDate());

  const diaSemana = fechaUTC.getUTCDay(); // 0 = domingo, 1 = lunes, etc.

  // CÁLCULO para obtener el lunes (semana empieza en lunes)
  let diasARestar = 0;

  // Si es domingo, ir al lunes anterior (restar 6 días)
  if (diaSemana === 0) {
    diasARestar = 6;

  // Para cualquier otro día, restar (día - 1) para llegar al lunes
  } else {
    
    diasARestar = diaSemana - 1;
  }
  
  console.log('Días a restar para llegar al lunes:', diasARestar);
  
  // CREAR el lunes de esa semana en UTC
  const lunes = new Date(Date.UTC(año, mes, dia - diasARestar, 0, 0, 0, 0));
  
  console.log('Lunes calculado:', lunes.toISOString());
  console.log('Verificación - día de la semana del lunes:', lunes.getUTCDay()); // Debe ser 1
  console.log('=== FIN DEBUG CORREGIDO ===');
  
  return lunes;
}

  private obtenerFinSemana(fecha: Date): Date {
    const inicioSemana = this.obtenerInicioSemana(fecha);
    const domingo = new Date(inicioSemana);
    domingo.setDate(inicioSemana.getDate() + 6); // Domingo
    domingo.setHours(23, 59, 59, 999); // 23:59:59
    return domingo;
  }
}