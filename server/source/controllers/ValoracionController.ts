import { PrismaClient } from "../../generated/prisma";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class ValoracionController {

  /**
   * Crear una nueva valoración
   */
  create = async (req: Request, res: Response) => {
    try {
      // Extraer datos del cuerpo de la solicitud
      const { ticketId, puntaje, comentario, creadoPorId } = req.body;

      // Validaciones
      if (!ticketId || !puntaje || !creadoPorId) {
        return res.status(400).json({
          message: 'ticketId, puntaje y creadoPorId son requeridos',
        });
      }

      // Validar rango de puntaje
      if (puntaje < 1 || puntaje > 5) {
        return res.status(400).json({
          message: 'El puntaje debe estar entre 1 y 5',
        });
      }

      // Verificar que el ticket existe
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { solicitante: true },
      });

      // Si no existe el ticket
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }

      // Verificar que el ticket está cerrado
      if (ticket.estado !== 'CERRADO') {
        return res.status(400).json({
          message: 'Solo se pueden valorar tickets cerrados',
        });
      }

      // Verificar que el usuario es el solicitante
      if (ticket.solicitanteId !== creadoPorId) {
        return res.status(403).json({
          message: 'Solo el solicitante puede valorar el ticket',
        });
      }

      // Verificar que no exista una valoración previa
      const valoracionExistente = await prisma.valoracionServicio.findUnique({
        where: { ticketId },
      });

      if (valoracionExistente) {
        return res.status(400).json({
          message: 'Este ticket ya tiene una valoración',
        });
      }

      // Crear la valoración
      const valoracion = await prisma.valoracionServicio.create({
        data: {
          ticketId,
          puntaje,
          comentario: comentario || null,
          creadoPorId,
        },
        include: {
          ticket: {
            select: {
              id: true,
              codigo: true,
              titulo: true,
            },
          },
          creadoPor: {
            select: {
              id: true,
              nombreUsuario: true,
              correo: true,
            },
          },
        },
      });

      return res.status(201).json(valoracion);
    } catch (error) {
      console.error('[VALORACION CONTROLLER] Error en create:', error);
      return res.status(500).json({
        message: 'Error al crear la valoración',
        error: error instanceof Error ? error.message : error,
      });
    }
  }

get = async (req: Request, res: Response) => {
  try {
    // Obtener todas las valoraciones con detalles del ticket y creador
    const valoraciones = await prisma.valoracionServicio.findMany({
      include: {
        ticket: {
          select: {
            id: true,
            codigo: true,
            titulo: true,
            usuarioAsignado: {
              select: {
                id: true,
                nombreUsuario: true,
                correo: true,
              },
            },
          },
        },
        creadoPor: {
          select: {
            id: true,
            nombreUsuario: true,
            correo: true,
          },
        },
      },
      orderBy: {
        creadoAt: 'desc',
      },
    });

    return res.status(200).json(valoraciones);
  } catch (error) {
    console.error('[VALORACION CONTROLLER] Error en get:', error);
    return res.status(500).json({
      message: 'Error al obtener las valoraciones',
      error: error instanceof Error ? error.message : error,
    });
  }
}
  
  //Obtener promedio de valoraciones de un técnico
  getPromedioByTecnico = async (req: Request, res: Response) => {
    try {
      const tecnicoId = parseInt(req.params.tecnicoId);

      if (isNaN(tecnicoId)) {
        return res.status(400).json({ message: 'tecnicoId inválido' });
      }

      // Obtener todos los tickets del técnico que tienen valoración
      const tickets = await prisma.ticket.findMany({
        where: {
          usuarioAsignadoId: tecnicoId,
          valoracion: {
            isNot: null,
          },
        },
        include: {
          valoracion: {
            select: {
              puntaje: true,
            },
          },
        },
      });

      // Si no hay tickets con valoración, retornar promedio 0
      if (tickets.length === 0) {
        return res.status(200).json({
          tecnicoId,
          promedio: 0,
          totalValoraciones: 0,
        });
      }

      // Calcular el promedio de puntajes
      const sumaPuntajes = tickets.reduce(
        (sum, ticket) => sum + (ticket.valoracion?.puntaje || 0),
        0
      );
      const promedio = sumaPuntajes / tickets.length;

      return res.status(200).json({
        tecnicoId,
        promedio: parseFloat(promedio.toFixed(2)),
        totalValoraciones: tickets.length,
      });
    } catch (error) {
      console.error('[VALORACION CONTROLLER] Error en getPromedioByTecnico:', error);
      return res.status(500).json({
        message: 'Error al calcular el promedio',
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}