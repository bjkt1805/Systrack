import {
  PrismaClient,
  EstadoTicket,
  Prioridad,
  Prisma,
} from "../../generated/prisma";
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
  getKanban = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
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

        console.log(
          `[BACKEND] Fecha de inicio calculada: ${fechaInicio.toISOString()}`
        );
        console.log(
          `[BACKEND] Fecha de fin calculada: ${fechaFin.toISOString()}`
        );
      } else {
        // Por defecto, usar la semana actual
        const hoy = new Date();
        fechaInicio = this.obtenerInicioSemana(hoy);
        fechaFin = this.obtenerFinSemana(hoy);
      }

      console.log(
        `Filtrando tickets de la semana: ${fechaInicio.toISOString()} a ${fechaFin.toISOString()}`
      );

      // Construir filtro de fecha
      const whereClause: Prisma.TicketWhereInput = {
        creadoAt: {
          gte: fechaInicio, // Mayor o igual a lunes 00:00:00
          lte: fechaFin, // Menor o igual a domingo 23:59:59
        },
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
                },
              },
            },
          },
          resueltoAt: true,
          cerradoAt: true,
          cumplioRespuesta: true,
          cumplioResolucion: true,
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
        total: listado.length,
      });
    } catch (error) {
      console.error("Error en método getKanban():", error);
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
      if (rol === "CLIENTE") {
        // Cliente: solo tickets creados por él
        whereClause.solicitanteId = usuarioId;

        // Si el cliente tiene el rol TÉCNICO, configurar el whereClause para utilizar
        // el usuarioAsignadoId como filtro
      } else if (rol === "TECNICO") {
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
              },
            },
            usuarioAsignado: {
              select: {
                id: true,
                nombreUsuario: true,
                nombreCompleto: true,
              },
            },
          },
        }),

        // Contar total de tickets para paginación
        // Select count(*) from ticket where ...
        // e incluir la clausula whereClause que contiene
        // el filtro por solicitanteId o usuarioAsignadoId según el rol
        this.prisma.ticket.count({
          where: whereClause,
        }),
      ]);

      // Respuesta con formato esperado por el frontend
      response.json({
        tickets,
        total,
        pagina: paginaNum,
        porPagina: limiteNum,
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
              descripcion: true,
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
              imagenes: true,
            },
            orderBy: { id: "asc" },
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

  /**
   * Generar código único para el ticket
   * @param id ID del ticket recién creado
   * @returns Código en formato INC-YYYY-<id>
   */
  private generateCodigoTicket(id: number): string {
    const currentYear = new Date().getFullYear();
    return `INC-${currentYear}-${id}`;
  }

  //CREAR UN TICKET
  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Obtener datos del tiquete mediante FormData (hay que parsear el JSON)
      const ticketData = JSON.parse(request.body.ticketData);

      console.log("contenido del body:", request.body);

      const imageFiles = request.files as Express.Multer.File[]; // Obtener archivos de imagen si existen (manejarlos mediante Multer)
      const newTicket = await this.prisma.ticket.create({
        data: {
          codigo: ticketData.codigo,
          titulo: ticketData.titulo,
          descripcion: ticketData.descripcion,
          estado: ticketData.estado,
          prioridad: ticketData.prioridad,
          solicitanteId: ticketData.solicitanteId,
          categoriaId: ticketData.categoriaId,
          usuarioAsignadoId: ticketData.usuarioAsignadoId,
          fechaLimiteRespuesta: ticketData.fechaLimiteRespuesta,
          fechaLimiteResolucion: ticketData.fechaLimiteResolucion,
          respondidoAt: ticketData.respondidoAt,
          resueltoAt: ticketData.resueltoAt,
          cerradoAt: ticketData.cerradoAt,
          cerradoPorId: ticketData.cerradoPorId,
          cumplioRespuesta: ticketData.cumplioRespuesta,
          cumplioResolucion: ticketData.cumplioResolucion,
        },
      });

      // GENERAR código con el ID obtenido
      const codigo = this.generateCodigoTicket(newTicket.id);

      // ACTUALIZAR el ticket con el código generado
      const ticketConCodigo = await this.prisma.ticket.update({
        where: { id: newTicket.id },
        data: { codigo },
        include: {
          solicitante: true,
          categoria: {
            include: {
              sla: true,
              etiquetas: true,
            },
          },
        },
      });

      // Crear una entrada inicial en el historial del ticket (historialTicket)
      const historial = await this.prisma.historialTicket.create({
        data: {
          ticketId: ticketConCodigo.id,
          cambiadoPorId: ticketConCodigo.solicitante.id,
          deEstado: null,
          aEstado: "PENDIENTE",
          nota: "Ticket creado",
        },
      });

      // Crear registros de imágenes si existen
      if (imageFiles.length > 0) {
        // Recorrer mediante map el array de imagenes (imageFiles)
        // y crear un arreglo de datos para insertar en imagenTicket
        // usando createMany
        const imagenesData = imageFiles.map((file) => ({
          historialId: historial.id,
          url: file.filename, // guardar el nombre del archivo como el url
          descripcion: `${file.originalname}`, // construir la descripcion de la imagen
        }));

        // Insertar las imágenes en la tabla imagenTicket
        await this.prisma.imagenTicket.createMany({
          data: imagenesData,
        });
      }

      console.log(`[BACKEND] Ticket creado exitosamente con código: ${codigo}`);
      response.status(201).json(ticketConCodigo);
    } catch (error) {
      console.error("[BACKEND] Error creando ticket:", error);
      next(error);
    }
  };

  //ACTUALIZAR TICKET
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      // Obtener el id del tiquete mediante el parámetro
      const idTicket = parseInt(request.params.id);

      // Obtener la data (parseada en JSON desde el formData enviado en el frontend)
      const ticketData = JSON.parse(request.body.ticketData);

      // Obtener la lista de imágenes (records) a borrar de imagenTicket mediante Multer
      const imageFiles = (request.files as Express.Multer.File[]) || [];

      // Obtener el array de Id de imagenes (records) a borrar de imagenTicket mediante Multer
      const imagesToDelete: number[] = request.body.imagesToDelete
        ? JSON.parse(request.body.imagesToDelete)
        : [];

      //Obtener ticket anterior
      const ticketExistente = await this.prisma.ticket.findUnique({
        where: { id: idTicket },
        include: {
          historiales: {
            where: { deEstado: null }, // Historial inicial (creación)
            include: { imagenes: true },
          },
        },
      });
      if (!ticketExistente) {
        response.status(404).json({ message: "El ticket no existe" });
        return;
      }

      //Actualizar tiquete
      const updateTicket = await this.prisma.ticket.update({
        where: {
          id: idTicket,
        },
        data: {
          codigo: ticketData.codigo,
          titulo: ticketData.titulo,
          descripcion: ticketData.descripcion,
          estado: ticketData.estado,
          prioridad: ticketData.prioridad,
          solicitanteId: ticketData.solicitanteId,
          categoriaId: ticketData.categoriaId,
          usuarioAsignadoId: ticketData.usuarioAsignadoId,
          fechaLimiteRespuesta: ticketData.fechaLimiteRespuesta,
          fechaLimiteResolucion: ticketData.fechaLimiteResolucion,
          respondidoAt: ticketData.respondidoAt,
          resueltoAt: ticketData.resueltoAt,
          cerradoAt: ticketData.cerradoAt,
          cerradoPorId: ticketData.cerradoPorId,
          cumplioRespuesta: ticketData.cumplioRespuesta,
          cumplioResolucion: ticketData.cumplioResolucion,
        },
      });

      // Eliminar las imágenes marcadas para borrar
      if (imagesToDelete.length > 0) {
        // Eliminar imágenes físicas en /uploads/assets (obtener URLs primero)
        const imagenesAEliminar = await this.prisma.imagenTicket.findMany({
          where: { id: { in: imagesToDelete } },
          select: { url: true },
        });

        // Eliminar registros de la BD
        const deletedCount = await this.prisma.imagenTicket.deleteMany({
          where: { id: { in: imagesToDelete } },
        });

        console.log(
          `[BACKEND] ${deletedCount.count} imagen(es) eliminada(s) de BD`
        );

        // Eliminar las imágenes / archivos físicamente
        const fs = require("fs");
        const path = require("path");

        // Recorrer el array imagenesAEliminar para borrar cada imagen físicamente de /assets/uploads
        imagenesAEliminar.forEach((imagen) => {
          const filePath = path.join(
            __dirname,
            "../../assets/uploads/",
            imagen.url
          );
          fs.unlink(filePath, (err: any) => {
            if (err) {
              console.warn(
                `[BACKEND] No se pudo eliminar imagen: ${imagen.url}`,
                err.message
              );
            } else {
              console.log(`[BACKEND] Imagen eliminada: ${imagen.url}`);
            }
          });
        });
      }

      // Agregar nuevas imágenes (si se añaden) al primer historial del tiquete
      if (imageFiles.length > 0) {
        // Como el primer historial del array historiales se crea automáticamente
        // acceder a él en el índice 0
        const historialInicial = ticketExistente.historiales[0];

        // Recorrer mediante map el array de imagenes (imageFiles)
        // y crear un arreglo de datos para insertar en imagenTicket
        // usando createMany
        const imagenesData = imageFiles.map((file) => ({
          historialId: historialInicial.id,
          url: file.filename, // guardar el nombre del archivo como el url
          descripcion: `${file.originalname}`, // construir la descripcion de la imagen
        }));

        // Insertar las imágenes en la tabla imagenTicket
        await this.prisma.imagenTicket.createMany({
          data: imagenesData,
        });
      }

      response.json(updateTicket);
    } catch (error) {
      next(error);
    }
  };

  /**
   * ACTUALIZAR EL ESTADO DEL TIQUETE
   *
   * El método hace lo siguiente:
   *
   * - Valida el flujo de estados del tiquete (respetar PENDIENTE, ASIGNADO, EN_PROCESO, RESUELTO, CERRADO)
   * - Valida los permisos por rol
   * - Valida el técnico asignado
   * - Actualiza el tiquete (estado, fechas, técnico)
   * - Creación de registro en tabla HistorialTicket
   * - Inserción de imágenes en tabla ImagenTicket
   */

  updateEstado = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      // Obtener el id del tiquete desde la petición
      const ticketId = parseInt(request.params.id);

      // Obtener nuevoEstado, nota, usuarioAsignadoId, imagenes desde el payload
      const {
        nuevoEstado,
        nota,
        usuarioAsignadoId,
        imagenes,
        usuarioActualId,
        usuarioActualRol,
      } = request.body;

      // Console log para debuguear los datos a actualizar

      console.log("[BACKEND] Actualizando estado del ticket:", {
        ticketId,
        nuevoEstado,
        usuarioActualId,
        usuarioActualRol,
        usuarioAsignadoId,
        cantidadImagenes: imagenes?.length || 0,
      });

      // Validación de id de tiquete
      if (!ticketId || isNaN(ticketId)) {
        return next(AppError.badRequest("ID de ticket inválido"));
      }

      // OBTENER EL TIQUETE ACTUAL POR MEDIO DE FINDUNIQUE
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          solicitante: true,
          usuarioAsignado: true,
          categoria: {
            include: { sla: true },
          },
        },
      });

      // Si no se encuentra el tiquete, enviar error
      if (!ticket) {
        return next(AppError.notFound("Ticket no encontrado"));
      }

      // Validar los flujos de estado
      const estadoActual = ticket.estado as EstadoTicket;
      this.validarTransicionEstado(estadoActual, nuevoEstado, usuarioActualRol);

      // Validar los permisos por rol
      const esCreador = ticket.solicitanteId == usuarioActualId;
      this.validarPermisoEstado(nuevoEstado, usuarioActualRol, esCreador);

      // Validar técnico asignado
      const tecnico = usuarioAsignadoId || ticket.usuarioAsignadoId;
      if (nuevoEstado !== "PENDIENTE" && !tecnico) {
        return next(
          AppError.badRequest("Debe asignar un técnico para avanzar el estado")
        );
      }

      // PREPARAR LOS DATOS DE ACTUALIZACIÓN DEL TIQUETE
      const dataActualizacion: any = {
        estado: nuevoEstado,
      };

      // Actualizar el técnico si se proporciona y es diferente
      if (usuarioAsignadoId && usuarioAsignadoId !== ticket.usuarioAsignadoId) {
        dataActualizacion.usuarioAsignadoId = usuarioAsignadoId;
      }

      const ahora = new Date();
      let cumplioRespuesta: boolean = false;
      let cumplioResolucion: boolean = false;

      // Actualizar las fechas según el estado
      switch (nuevoEstado) {
        case "ASIGNADO":
          // Este estado no calcula fechas
          break;

        case "EN_PROCESO":
          // Se actualiza la fecha de respuesta
          if (!ticket.respondidoAt) {
            dataActualizacion.respondidoAt = ahora;

            // Calcular si se cumplió la respuesta del tiquete
            if (ticket.fechaLimiteRespuesta) {
              cumplioRespuesta = ahora <= ticket.fechaLimiteRespuesta;
              dataActualizacion.cumplioRespuesta = cumplioRespuesta;
            } else {
              dataActualizacion.cumplioRespuesta = false;
            }
          }
          break;

        case "RESUELTO":
          // Se actualiza la fecha de resolución
          if (!ticket.resueltoAt) {
            dataActualizacion.resueltoAt = ahora;

            // Calcular si se cumplió la resolución del tiquete

            if (ticket.fechaLimiteResolucion) {
              cumplioResolucion = ahora <= ticket.fechaLimiteResolucion;
              dataActualizacion.cumplioResolucion = cumplioResolucion;
            } else {
              dataActualizacion.cumplioResolucion = false;
            }

            // Bajar en uno la carga del técnico
            if (ticket.usuarioAsignadoId) {
              await this.prisma.usuario.update({
                where: { id: ticket.usuarioAsignadoId },
                data: {
                  cargaTrabajo: {
                    decrement: 1, // Bajar en uno la carga de trabajo
                  },
                },
              });
              console.log(
                "Carga de trabajo dismunuida para el técnico con id: ",
                ticket.usuarioAsignadoId
              );
            }
          }
          break;

        case "CERRADO":
          if (!ticket.cerradoAt) {
            dataActualizacion.cerradoAt = ahora;
            dataActualizacion.cerradoPorId = usuarioActualId;

            // Si no se resolvión antes, marcar aquí
            if (!ticket.resueltoAt) {
              dataActualizacion.resueltoAt = ahora;

              if (ticket.fechaLimiteResolucion) {
                dataActualizacion.cumplioResolucion =
                  ahora <= ticket.fechaLimiteResolucion;
              } else {
                dataActualizacion.cumplioResolucion = false;
              }
            }

            // Si no se respondió antes, marcar aquí
            if (!ticket.respondidoAt) {
              dataActualizacion.respondidoAt = ahora;

              if (ticket.fechaLimiteRespuesta) {
                dataActualizacion.cumplioRespuesta =
                  ahora <= ticket.fechaLimiteRespuesta;
              } else {
                dataActualizacion.cumplioRespuesta = false;
              }
            }

            // Bajar en uno la carga del técnico (Admin cierra directamente desde Asignado o EN_PROCESO)
            if (!ticket.resueltoAt && ticket.usuarioAsignadoId) {
              await this.prisma.usuario.update({
                where: { id: ticket.usuarioAsignadoId },
                data: {
                  cargaTrabajo: {
                    decrement: 1, // Bajar en uno la carga de trabajo
                  },
                },
              });
            }
          }
          break;
      }

      // Actualizar el tiquete, crear una entrada en HistorialTicket y
      // crear varias entradas en ImagenTicket por medio de una transacción
      // de Prisma
      const transaccion = await this.prisma.$transaction(async (prisma) => {
        // Actualizar el tiquete
        const ticketActualizado = await prisma.ticket.update({
          where: { id: ticketId },
          data: dataActualizacion,
          include: {
            solicitante: true,
            usuarioAsignado: true,
            categoria: {
              include: { sla: true },
            },
          },
        });

        // Crear un registro en HistorialTicket
        const historial = await prisma.historialTicket.create({
          data: {
            ticketId: ticketId,
            cambiadoPorId: usuarioActualId,
            deEstado: estadoActual,
            aEstado: nuevoEstado,
            nota: nota.trim(), // Quitar espacios en blanco de nota
          },
        });

        // Insertar las imágenes a ImagenTicket
        if (imagenes && imagenes.length > 0) {
          const imagenesData = imagenes.map((filename: string) => ({
            historialId: historial.id,
            url: filename,
            descripcion: `Imagen de evidencia. Cambio de: ${estadoActual} a ${nuevoEstado}`,
          }));

          await prisma.imagenTicket.createMany({
            data: imagenesData,
          });
        }
        return { ticketActualizado, historial };
      });

      console.log("[BACKEND] Estado actualizado exitosamente:", {
        ticketId,
        estadoAnterior: estadoActual,
        estadoNuevo: nuevoEstado,
        historialId: transaccion.historial.id,
      });
      // Enviar notificación al usuario dependiendo del nuevo estado
      switch (nuevoEstado) {

        // Si el caso está entra en estado EN_PROCESO, enviar notificación al cliente
        // y al ténico asignado
        case 'EN_PROCESO':
          // Notificación al cliente (solicitante)
          await this.prisma.notificacion.create({

            // Notificación al solicitante
            data: {
              tipo: 'ESTADO_CAMBIADO',
              emisorId: null,
              receptorId: ticket.solicitanteId,
              ticketId: ticketId,
              estado: 'NO_LEIDA',
              mensaje: `El estado del ticket ${ticket.codigo} ha sido actualizado a "En proceso".`,
            }
          });

          // Notificación al técnico asignado
          if (ticket.usuarioAsignadoId) {
            await this.prisma.notificacion.create({
              data: {
                tipo: 'ESTADO_CAMBIADO',
                emisorId: null,
                receptorId: ticket.usuarioAsignadoId,
                ticketId: ticketId,
                estado: 'NO_LEIDA',
                mensaje: `El estado del ticket ${ticket.codigo} ha sido actualizado a "En proceso".`,

              }
            });
          }
          break;

        // Si el caso está entra en estado RESUELTO, enviar notificación al cliente
        // y al ténico asignado
        case 'RESUELTO':
          // Notificación al cliente (solicitante)
          await this.prisma.notificacion.create({
            data: {
              tipo: 'ESTADO_CAMBIADO',
              emisorId: null,
              receptorId: ticket.solicitanteId,
              ticketId: ticketId,
              estado: 'NO_LEIDA',
              mensaje: `El estado del ticket ${ticket.codigo} ha sido actualizado a "Resuelto". Por favor, revise la solución proporcionada.`,
            }
          });

          // Notificación al técnico asignado
          if (ticket.usuarioAsignadoId) {
            await this.prisma.notificacion.create({
              data: {
                tipo: 'ESTADO_CAMBIADO',
                emisorId: null,
                receptorId: ticket.usuarioAsignadoId,
                ticketId: ticketId,
                estado: 'NO_LEIDA',
                mensaje: `El estado del ticket ${ticket.codigo} ha sido actualizado a "Resuelto".`,
              }
            })
          };
          break;

        // Si el caso está entra en estado CERRADO, enviar notificación al cliente
        case 'CERRADO':
          // Notificación al cliente (solicitante)
          await this.prisma.notificacion.create({
            data: {
              tipo: 'ESTADO_CAMBIADO',
              emisorId: null,
              receptorId: ticket.solicitanteId,
              ticketId: ticketId,
              estado: 'NO_LEIDA',
              mensaje: `El ticket ${ticket.codigo} ha sido cerrado. Gracias por utilizar nuestro servicio.`,
            }
          });
          break;
      }

      console.log('[BACKEND] Notificaciones enviadas según el nuevo estado');

      // Enviar la respuesta de transacción exitosa 
      response.json({
        success: true,
        message: `Estado actualizado de ${estadoActual} a ${nuevoEstado}`,
        ticket: transaccion.ticketActualizado,
        historial: transaccion.historial,
      });
    } catch (error: any) {
      console.error("[BACKEND] Error al actualizar estado:", error);
      next(error);
    }
  };

  /**
   * Validar que la transición de estado sea valida según el flujo del tiquete
   * PENDIENTE -> ASIGNADO -> EN_PROCESO -> RESUELTO -> CERRADO
   */
  private validarTransicionEstado(
    estadoActual: EstadoTicket,
    estadoNuevo: EstadoTicket,
    usuarioRol: string
  ): void {
    // Permitir que el usuario ADMIN puede cerrar el tiquete directamente
    if (usuarioRol === "ADMIN") {
      // El admin solo puede cambiar de Pendiente a Asignado y de cualquier
      // estado a Cerrado. Crear un arreglo con los estados permitidos para
      // el admin
      const transicionesPermitidas = [
        estadoActual === "PENDIENTE" && estadoNuevo === "ASIGNADO",
        estadoNuevo === "CERRADO" && estadoActual !== "CERRADO",
      ];

      // Validar si el estado no está dentro de las transiciones permitidas.
      // En caso de no ser así, arrojar error.

      if (!transicionesPermitidas.some((permitido) => permitido)) {
        throw AppError.forbidden(
          `Como ADMIN solo se puede: ` +
            `1) Asignar tickets (PENDIENTE → ASIGNADO), ` +
            `2) Cerrar tickets (desde cualquier estado)`
        );
      }

      console.log(
        `[BACKEND] ADMIN realizando transición: ${estadoActual} → ${estadoNuevo}`
      );
      return; // Salirse de la función
    }

    // A través de un record/map mapear los estados del tiquete
    const FLUJO_ESTADOS: Record<EstadoTicket, EstadoTicket[]> = {
      PENDIENTE: ["ASIGNADO"], // De Pendiente a Asignado
      ASIGNADO: ["EN_PROCESO"], // De Asignado a En Proceso
      EN_PROCESO: ["RESUELTO"], // De En Proceso a Resuelto
      RESUELTO: ["CERRADO"], // De Resuelto a Cerrado
      CERRADO: [], // De Cerrado a null (por ser el último estado)
    };

    // Obtener los estados permitidos para el estado actual
    // Por ejemplo: si estadoActual es PENDIENTE, FLUJO_ESTADOS
    // mapea a ASIGNADO
    const estadosPermitidos = FLUJO_ESTADOS[estadoActual];

    // Validar si el estadoNuevo está en los estados permitidos
    if (!estadosPermitidos.includes(estadoNuevo as any)) {
      // Si no lo está, enviar un error
      throw AppError.badRequest(
        `No se puede cambiar de ${estadoActual} a ${estadoNuevo}. ` +
          `Estados permitidos: ${estadosPermitidos.join(", ")}`
      );
    }
  }

  /**
   * Validar si el usuario tiene permiso para cambiar el estado
   * actual del tiquete
   */
  private validarPermisoEstado(
    estadoNuevo: EstadoTicket, // recibir el estado nuevo del tiquete
    rol: string, // obtener el rol del usuario
    esCreador: boolean // revisar si el usuario es el creador del tiquete
  ): void {
    // Validación para Admin
    if (rol === 'ADMIN') {
      // Admin solo puede cambiar a ASIGNADO o CERRADO

      // Si el estado nuevo no es ni ASIGNADO, ni CERRADO, enviar mensaje de error (forbidden)
      if (!['ASIGNADO', 'CERRADO'].includes(estadoNuevo)) {
        throw AppError.forbidden(
          'Como ADMIN solo puede asignar técnicos (ASIGNADO) o cerrar tickets (CERRADO). ' +
          'Los estados EN_PROCESO y RESUELTO son exclusivos de técnicos.'
        );
      }
      console.log(`[BACKEND] ADMIN tiene permiso para cambiar a ${estadoNuevo}`);
    if (rol === "ADMIN") {
      // Admin solo puede cambiar a ASIGNADO o CERRADO

      // Si el estado nuevo no es ni ASIGNADO, ni CERRADO, enviar mensaje de error (forbidden)
      if (!["ASIGNADO", "CERRADO"].includes(estadoNuevo)) {
        throw AppError.forbidden(
          "Como ADMIN solo puedes asignar técnicos (ASIGNADO) o cerrar tickets (CERRADO). " +
            "Los estados EN_PROCESO y RESUELTO son exclusivos de técnicos."
        );
      }
      console.log(
        `[BACKEND] ADMIN tiene permiso para cambiar a ${estadoNuevo}`
      );
      return; // Salir de la función para usuario ADMIN
    }

    // Solo el usuario ADMIN puede asignar tiquetes
    if (estadoNuevo === "ASIGNADO") {
      if (rol !== "ADMIN") {
        throw AppError.forbidden("Solo ADMIN puede asignar técnicos");
      }
      return; // Salir de la función para usuario ADMIN
    }

    // Solo los técnicos pueden cambiar el estado de EN_PROCESO o RESUELTO
    // Revisar si estadoNuevo es "EN_PROCESO" o "RESUELTO" para técnico
    if (["EN_PROCESO", "RESUELTO"].includes(estadoNuevo)) {
      // if (rol !== 'TECNICO' && rol !== 'ADMIN') {
      if (rol !== "TECNICO") {
        throw AppError.forbidden("Solo técnicos pueden cambiar a este estado");
      }
    }

    // Solo el cliente creador del tiquete o admin pueden cerrar el tiquete
    if (estadoNuevo === "CERRADO") {
      if (!esCreador && rol !== "ADMIN") {
        throw AppError.forbidden(
          "Solo el creador del tiquete o el admin puede cerrarlo"
        );
      }
    }
  }
  }
  // MÉTODOS PARA CÁLCULO DE SEMANA
  private obtenerInicioSemana(fecha: Date): Date {
    // TRABAJAR en UTC para evitar conversiones de zona horaria
    const año = fecha.getUTCFullYear();
    const mes = fecha.getUTCMonth();
    const dia = fecha.getUTCDate();

    // CREAR fecha UTC explícita
    const fechaUTC = new Date(Date.UTC(año, mes, dia, 0, 0, 0, 0));

    console.log("[BACKEND] === DEBUG INICIO SEMANA ===");
    console.log("[BACKEND] Fecha original:", fecha.toISOString());
    console.log("[BACKEND] Fecha UTC creada:", fechaUTC.toISOString());
    console.log("[BACKEND] getUTCDay():", fechaUTC.getUTCDay());
    console.log("[BACKEND] getUTCDate():", fechaUTC.getUTCDate());

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

    console.log("Días a restar para llegar al lunes:", diasARestar);

    // CREAR el lunes de esa semana en UTC
    const lunes = new Date(Date.UTC(año, mes, dia - diasARestar, 0, 0, 0, 0));

    console.log("Lunes calculado:", lunes.toISOString());
    console.log(
      "Verificación - día de la semana del lunes:",
      lunes.getUTCDay()
    ); // Debe ser 1
    console.log("=== FIN DEBUG CORREGIDO ===");

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