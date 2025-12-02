import { Request, Response, NextFunction } from 'express';
import { EstadoTicket, MetodoAsignacion, Prioridad, PrismaClient, Regla, Ticket, Usuario } from '../../generated/prisma';
import { AppError } from '../errors/custom.error';

// Tipo personalizado para traer el técnico con sus especialidades
type Tecnico = Usuario & {
  especialidades: {
    nombre: string;
  }[];
};

// Tipo personalizado para mostrar información del técnico con puntaje
type TecnicoPuntuado = {
  tecnicoId: number;
  nombreCompleto: string;
  correo: string;
  especialidades: string[];
  cargaTrabajo: number;
  puntajeTecnico: number;
  slaRestante: number;
  pesoPrioridad: number;
  reglaAplicada: {
    id: number;
    nombre: string;
  }
  criterios: {
    tieneEspecialidad: boolean;
    dentroCargaTrabajo: boolean;
    disponible: boolean;
  };
};

export class AsignacionController {

  prisma = new PrismaClient();

  /**
   * Obtener el peso basado en la prioridad
   * @param prioridad
   * @returns número que representa el peso de la prioridad
   */
  getPesoPrioridad = (prioridad: Prioridad): number => {

    // Objeto de mapeo de prioridades a pesos
    const pesosPrioridad = {
      'URGENTE': 4,
      'ALTA': 3,
      'MEDIA': 2,
      'BAJA': 1
    };

    // devolver el peso relacionado a la prioridad
    return pesosPrioridad[prioridad];
  };

  /**
   * Obtener el tecnico asignado al tiquete a través su id
   * @param tecnicoId
   * @returns Usuario técnico
   * 
   */
  getTecnicoById = async (tecnicoId: number): Promise<Tecnico> => {

    const tecnico = await this.prisma.usuario.findUnique({
      where: { id: tecnicoId, rol: 'TECNICO' },
      include: {
        especialidades: true,
      }
    });

    return tecnico! as Tecnico;
  }

  /**
   * 
   * @param ticket 
   * @param tecnico 
   * @param regla 
   * @param slaRestante 
   * @param pesoPrioridad 
   * @returns 
   */

  /**
   * Generar una justificación de la asignación (esto se guardará en la tabla de asignaciones)
   */
  generarJustificacion = async (
    ticketP: Ticket,
    tecnicoId: number,
    regla: {
      id: number;
      nombre: string;
    },
    slaRestante: number,
    pesoPrioridad: number,
  ): Promise<string> => {

    const tecnico = await this.getTecnicoById(tecnicoId);

    const cargaTrabajo = tecnico.cargaTrabajo ?? 0;

    return `
            Ticket ${ticketP.codigo} asignado a ${tecnico.nombreCompleto}

            CRITERIOS DE ASIGNACIÓN:
            - Categoría Id: ${ticketP.categoriaId}
            - Prioridad: ${ticketP.prioridad} (peso: ${pesoPrioridad})
            - SLA restante: ${slaRestante.toFixed(2)} horas
            - Regla aplicada: ${regla.nombre}

            TÉCNICO SELECCIONADO:
            - Nombre: ${tecnico.nombreCompleto}
            - Especialidades: ${tecnico.especialidades.map(esp => esp.nombre).join(', ')}
            - Carga actual: ${tecnico.cargaTrabajo} tickets

            CÁLCULO:
            - Puntaje (EJEMPLO) = (Prioridad × 1000) - SLA restante - (Carga × 50)
            - Puntaje (FÓRMULA APLICADA)= (${pesoPrioridad} × 1000) - ${slaRestante.toFixed(2)} - (${tecnico.cargaTrabajo} × 50)
            - Puntaje (FINAL) = ${(pesoPrioridad * 1000) - slaRestante - (cargaTrabajo * 50)}
            `

  }

  /**
   * Método POST para iniciar la autoasignación del ticket 
   * al técnico más adecuado según las reglas definidas
   * 
   */
  autoAsignarTicket = async (req: Request, res: Response, next: NextFunction) => {

    const ticketId = parseInt(req.params.id, 10);
    // Obtener el tiquete con toda la información necesarioa
    try {
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          categoria: {
            include: {
              sla: true,
              especialidades: true,
              etiquetas: true,
            }
          },
          solicitante: true,
        },

      });

      console.log(`[AUTO-ASIGNACIÓN] Información del tiquete: ${JSON.stringify(ticket)}`);

      // Validar si el ticket existe, si no devolver error
      if (!ticket) {
        return next(AppError.notFound('Ticket no encontrado'));
      }

      // Calcular el tiempoRestante del SLA de resolucion del tiquete
      const ahora = new Date();
      const fechaLimite = new Date(ticket.fechaLimiteResolucion);

      // Obtener el SLA restante em milisegundos
      const slaRestanteMs = fechaLimite.getTime() - ahora.getTime();

      // Convertir el SLA restante a horas
      const slaRestanteHoras = slaRestanteMs / (1000 * 60 * 60);

      // Si el SLA de resolución ya venció, utilizar 0 
      const slaRestante = Math.max(0, slaRestanteHoras);

      // Calcular el puntaje base del ticket 
      const pesoPrioridad = this.getPesoPrioridad(ticket.prioridad);

      // Peso de prioridad * 1000 - SLA restante en horas
      const puntajeTicket = (pesoPrioridad * 1000) - slaRestante;

      // Debuguear la respuesta de autoasignación
      console.log(`Puntaje base para el ticket ${ticket.codigo}: ${puntajeTicket}`);

      // Buscar las reglas aplicables a la categoria (incluyendo las especialidades del tiquete)
      const reglasAplicables = await this.prisma.regla.findMany({
        where: {
          activa: true,
          categoriaId: ticket.categoriaId,

          // utilizar OR para manejar reglas que aplican a todas las prioridades
          OR: [
            { aplicaATodasPrioridades: true }, // regla aplica a todas las prioridades
            { prioridad: ticket.prioridad } // regla aplica a la prioridad del ticket
          ]
        },

        // incluir las categorias y especialidades a las que se aplica la regla 
        include: {
          categoria: true,
          especialidad: true
        },

        // ordenar por el orden de Prioridad
        orderBy: { ordenPrioridad: 'asc' }
      });

      // Verificar si hay reglas aplicables. Si no las hay, el tiquete requiere asignación manual
      if (reglasAplicables.length === 0) {
        return res.status(200).json({
          success: false,
          error: "No hay reglas de asignación aplicables para este ticket. Se requiere asignación manual."
        });
      }

      // Debuguear las reglas aplicables al tiquete 
      console.log(`[AUTO-ASIGNACIÓN] Reglas aplicables para el ticket ${ticket.codigo}:`, reglasAplicables);

      // Variable para guardar el mejor técnico disponible 
      let mejorTecnico: TecnicoPuntuado = null!;

      // Recorrer la lista de reglas y obtener la lista de técnicos potenciales
      for (const regla of reglasAplicables) {

        console.log(`[AUTO-ASIGNACIÓN] Evaluación de regla: ${regla.nombre}`);

        // Buscar los técnicos que tengan la especialidad requerida en la regla
        const tecnicosPotenciales = await this.prisma.usuario.findMany({

          // Filtrar las especialidades del técnico que coincidan con la de la regla
          // mediante el operador some
          where: {
            rol: 'TECNICO',
            estadoTecnico: 'DISPONIBLE',
            activo: true,
            especialidades: {
              some: { id: regla.especialidadId }
            }
          },

          // Incluir las especialidades y los tiquetes asignados
          include: {
            especialidades: true,
            ticketsAsignados: {
              where: {
                estado: {
                  in: ['ASIGNADO', 'EN_PROCESO']
                }
              }
            }
          }
        });

        console.log(`[AUTO-ASIGNACIÓN] Técnicos potenciales con especialidad ${regla.especialidad?.nombre} para la regla ${regla.nombre}:`, tecnicosPotenciales);

        // Filtrar los técnicos por su carga de trabajo (cantidad de tiquetes asignados)
        const tecnicosFiltrados = tecnicosPotenciales.filter(tecnico => {

          // Obtener la cantidad de tiquetes asignados actualmente al técnico
          const cargaTrabajo = tecnico.ticketsAsignados.length;

          // Verificar si la carga de trabajo es menor al peso definido en la regla
          // devuelve true si la carga de trabajo es menor al peso definido en la regla
          return cargaTrabajo < regla.pesoCargaTrabajo!;
        })

        // Si la longitud de los técnicos filtrados es 0 , salirse del ciclo y probar la siguiente regla
        if (tecnicosFiltrados.length === 0) {
          console.log(`[AUTO-ASIGNACIÓN] Ningún técnico cumple con la carga de trabajo para la regla ${regla.nombre}. Probando siguiente regla.`);
          continue; // probar la siguiente regla
        }

        // Calcular el puntaje para cada técnico filtrado (utilizar la lista de técnicos filtrados)
        const tecnicosPuntuados: TecnicoPuntuado[] = tecnicosFiltrados.map(tecnico => {
          const cargaTrabajo = tecnico.ticketsAsignados.length; // Obtener la carga de trabajo actual

          // Calcular el puntaje del técnico
          // Utilizar una regla de puntaje donde se penalice la carga de trabajo. 
          // Por cada tiquete asignado, se resta 50 puntos, así se favorece a técnicos con menos carga
          const puntajeTecnico = puntajeTicket - (cargaTrabajo * 50);

          //Devolver informacion del técnico junto con puntaje y otra información 
          // para mostrar en la justificación
          return {
            tecnicoId: tecnico.id,
            nombreCompleto: tecnico.nombreCompleto,
            correo: tecnico.correo,
            especialidades: tecnico.especialidades.map(esp => esp.nombre),
            cargaTrabajo,
            puntajeTecnico,
            slaRestante,
            pesoPrioridad,
            reglaAplicada: {
              id: regla.id,
              nombre: regla.nombre
            },
            criterios: {
              tieneEspecialidad: true,
              dentroCargaTrabajo: true,
              disponible: true
            }
          };
        });

        // Seleccionar al técnico con el mejor puntaje (utiliar método sort)
        const tecnicoSeleccionado = tecnicosPuntuados.sort((a, b) => b.puntajeTecnico - a.puntajeTecnico)[0];

        // Si la variable mejorTecnico es nula o el puntaje del tecnico Seleccionado 
        // es mayor al puntaje de mejorTecnico, asignarle a mejorTecnico el valor de tecnicoSeleccionado
        if (!mejorTecnico || tecnicoSeleccionado.puntajeTecnico > mejorTecnico.puntajeTecnico) {
          mejorTecnico = tecnicoSeleccionado;

          // Mostrar en consola el mejor tecnico
          console.log(`[AUTO-ASIGNACIÓN] Nuevo mejor técnico seleccionado:`, mejorTecnico);
        }

        break; // salir del ciclo de reglas una vez se encuentra un técnico adecuado
      }

      // Si finalmente no se encontró un mejor técnico, devolver error
      if (!mejorTecnico) {
        return res.status(200).json({
          success: false,
          error: "No se encontró un técnico adecuado para asignar el ticket. Se requiere asignación manual."
        });
      }

      // Actualizar el tiquete con el técnico asignado
      await this.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          usuarioAsignadoId: mejorTecnico.tecnicoId,
          estado: EstadoTicket.ASIGNADO,
        }
      });

      // Registrar la asignación en la tabla de asignaciones
      await this.prisma.asignacion.create({
        data: {
          ticketId: ticketId,
          usuarioTecnicoId: mejorTecnico.tecnicoId,
          metodo: MetodoAsignacion.AUTOMATICA,
          motivo: await this.generarJustificacion(
            ticket, mejorTecnico.tecnicoId, mejorTecnico.reglaAplicada, slaRestante, pesoPrioridad),
          puntajePrioridad: pesoPrioridad * 1000,
          slaRestanteMin: Math.floor(slaRestante * 60), // convertir a minutos
          reglaId: mejorTecnico.reglaAplicada.id,
        }
      });

      // Actualizar la carga de trabajo del técnico (incrementar en 1)
      await this.prisma.usuario.update({
        where: { id: mejorTecnico.tecnicoId },
        data: {
          cargaTrabajo: {
            increment: 1 // incrementar en 1 la carga de trabajo
          }
        }
      });

      // Crear entrada en historial del tiquete 
      await this.prisma.historialTicket.create({
        data: {
          ticketId: ticketId,
          // cambiadoPorId: null, // Se cambia por el sistema automáticamante
          deEstado: ticket.estado,
          aEstado: EstadoTicket.ASIGNADO,
          nota: `Ticket asignado automáticamente al técnico ${mejorTecnico.nombreCompleto} mediante la regla ${mejorTecnico.reglaAplicada.nombre}.`
        }
      });

      // Variable para almacenar la justificación de la asignación 
      const justificacion = await this.generarJustificacion(ticket, mejorTecnico.tecnicoId, mejorTecnico.reglaAplicada, slaRestante, pesoPrioridad);

      // Crear notificaciones
      await this.prisma.notificacion.createMany({
        data: [
          // Notificación para el técnico
          {
            tipo: 'TICKET_ASIGNADO',
            emisorId: null, // sistema
            receptorId: mejorTecnico.tecnicoId,
            ticketId: ticketId,
            estado: 'NO_LEIDA',
            mensaje: `Se le ha asignado un nuevo tiquete ${ticket.codigo}: ${ticket.titulo}. Justificación: ${justificacion}`,
            leidoAt: null,
            atendidoAt: null
          },

          // Notificación para los administradores
          {
            tipo: 'TICKET_ASIGNADO',
            emisorId: null, // sistema
            receptorId: 1, // administrador
            ticketId: ticketId,
            estado: 'NO_LEIDA',
            mensaje: `Se ha asignado automáticamente el tiquete ${ticket.codigo} al técnico ${mejorTecnico.nombreCompleto}. Justificación: ${justificacion}`,
            leidoAt: null,
            atendidoAt: null
          },
          {
            tipo: 'TICKET_ASIGNADO',
            emisorId: null, // sistema
            receptorId: 2, // administrador
            ticketId: ticketId,
            estado: 'NO_LEIDA',
            mensaje: `Se ha asignado automáticamente el tiquete ${ticket.codigo} al técnico ${mejorTecnico.nombreCompleto}. Justificación: ${justificacion}`,
            leidoAt: null,
            atendidoAt: null
          },

          // Notificación para el cliente
          {
            tipo: 'ESTADO_CAMBIADO',
            emisorId: null, // sistema
            receptorId: ticket.solicitanteId,
            ticketId: ticketId,
            estado: 'NO_LEIDA',
            mensaje: `Su tiquete ${ticket.codigo} ha sido asignado a un técnico y está en proceso de atención.`,
            leidoAt: null,
            atendidoAt: null
          }
        ]
      });

      // Retornar la respuesta  de éxito 
      return res.status(200).json({
        success: true,
        message: `Ticket ${ticket.codigo} asignado automáticamente al técnico ${mejorTecnico.nombreCompleto}.`,
        data: {
          ticketId: ticket.id,
          ticketCodigo: ticket.codigo,
          tecnicoAsignado: {
            tecnicoId: mejorTecnico.tecnicoId,
            nombreCompleto: mejorTecnico.nombreCompleto,
            correo: mejorTecnico.correo,
            especialidades: mejorTecnico.especialidades,
          },
        }
      });

    } catch (error) {
      console.error('[AUTO ASIGNACIÓN]Error en auto-asignación de ticket:', error);
      next(error);
    }
  }

  asignarManual = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      // Obtener ID del ticket desde parámetros de ruta
      const ticketId = parseInt(request.params.id);

      // Obtener datos desde el body
      const { tecnicoId, justificacion, metodo, usuarioActualId } =
        request.body;

      console.log("[BACKEND] Asignación manual recibida:", {
        ticketId,
        tecnicoId,
        justificacion,
        metodo,
        usuarioActualId,
      });

      //Validaciones basicas
      if (!ticketId || isNaN(ticketId)) {
        return next(AppError.badRequest("ID de ticket inválido"));
      }

      if (!tecnicoId || isNaN(tecnicoId)) {
        return next(AppError.badRequest("ID de técnico inválido"));
      }

      if (!justificacion || justificacion.trim().length < 5) {
        return next(
          AppError.badRequest(
            "La justificación debe tener al menos 5 caracteres"
          )
        );
      }

      // Validar que el ticket existe y está pendiente
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          categoria: {
            include: { sla: true },
          },
        },
      });

      if (!ticket) {
        return next(AppError.notFound("Ticket no encontrado"));
      }

      if (ticket.estado !== "PENDIENTE") {
        return next(
          AppError.badRequest(
            "Solo se pueden asignar tickets en estado PENDIENTE"
          )
        );
      }

      // Validar que el técnico existe y está disponible
      const tecnico = await this.prisma.usuario.findUnique({
        where: { id: tecnicoId },
        select: {
          id: true,
          nombreCompleto: true,
          correo: true,
          rol: true,
          estadoTecnico: true,
          cargaTrabajo: true,
          especialidades: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });

      if (!tecnico || tecnico.rol !== "TECNICO") {
        return next(AppError.notFound("Técnico no encontrado"));
      }

      if (tecnico.estadoTecnico !== "DISPONIBLE") {
        return next(
          AppError.badRequest(
            `El técnico ${tecnico.nombreCompleto} no está disponible`
          )
        );
      }

      // Hacer la asignacion
      const resultado = await this.prisma.$transaction(async (prisma) => {
        // Actualizar estado del ticket a asignado y le pone el tecnico
        const ticketActualizado = await prisma.ticket.update({
          where: { id: ticketId },
          data: {
            usuarioAsignadoId: tecnicoId,
            estado: "ASIGNADO",
          },
          include: {
            categoria: {
              include: { sla: true },
            },
            usuarioAsignado: {
              select: {
                id: true,
                nombreCompleto: true,
                correo: true,
                especialidades: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
            },
            solicitante: {
              select: {
                id: true,
                nombreCompleto: true,
                correo: true,
              },
            },
          },
        });

        // Crea historial
        const historial = await prisma.historialTicket.create({
          data: {
            ticketId: ticketId,
            cambiadoPorId: usuarioActualId,
            deEstado: "PENDIENTE",
            aEstado: "ASIGNADO",
            nota: `Asignación manual por ${metodo}. Justificación: ${justificacion.trim()}`,
          },
        });

        // Incrementar carga de trabajo del técnico en 1
        const tecnicoActualizado = await prisma.usuario.update({
          where: { id: tecnicoId },
          data: {
            cargaTrabajo: {
              increment: 1, // Sumar 1 a la carga de trabajo
            },
          },
        });
        console.log(
          `[BACKEND] Carga de trabajo actualizada para técnico ${tecnicoId}: ${tecnicoActualizado.cargaTrabajo}`
        );

        return {
          ticketActualizado,
          historial,
          cargaTrabajo: tecnicoActualizado.cargaTrabajo,
        };
      }, {
        timeout: 10000, // 10 segundos
        maxWait: 5000, // 5 segundos máximo esperando para adquirir la transacción
      });

      // Crear notificaciones fuera de la transacción para que no de timeout
      await this.prisma.notificacion.createMany({
        data: [
          // Notificación para el técnico
          {
            tipo: 'TICKET_ASIGNADO',
            emisorId: null, // sistema
            receptorId: tecnicoId,
            ticketId: ticketId,
            estado: 'NO_LEIDA',
            mensaje: `Se le ha asignado un nuevo tiquete ${ticket.codigo}: ${ticket.titulo}. Justificación: el administrador le asignó el tiquete manualmente`,
            leidoAt: null,
            atendidoAt: null
          },

          // Notificación para los administradores
          {
            tipo: 'TICKET_ASIGNADO',
            emisorId: null, // sistema
            receptorId: 1, // administrador
            ticketId: ticketId,
            estado: 'NO_LEIDA',
            mensaje: `Se ha asignado manualmente el tiquete ${ticket.codigo} al técnico ${tecnico.nombreCompleto}. Justificación: el administrador asignó el tiquete manualmente`,
            leidoAt: null,
            atendidoAt: null
          },
          {
            tipo: 'TICKET_ASIGNADO',
            emisorId: null, // sistema
            receptorId: 2, // administrador
            ticketId: ticketId,
            estado: 'NO_LEIDA',
            mensaje: `Se ha asignado manualmente el tiquete ${ticket.codigo} al técnico ${tecnico.nombreCompleto}. Justificación: el administrador asignó el tiquete manualmente`,
            leidoAt: null,
            atendidoAt: null
          },

          // Notificación para el cliente
          {
            tipo: 'ESTADO_CAMBIADO',
            emisorId: null, // sistema
            receptorId: ticket.solicitanteId,
            ticketId: ticketId,
            estado: 'NO_LEIDA',
            mensaje: `Su tiquete ${ticket.codigo} ha sido asignado a un técnico y está en proceso de atención.`,
            leidoAt: null,
            atendidoAt: null
          }
        ]
      });

      console.log("[BACKEND] Ticket asignado exitosamente:", {
        ticketId,
        codigo: ticket.codigo,
        tecnicoId,
        tecnicoNombre: tecnico.nombreCompleto,
        cargaTrabajo: resultado.cargaTrabajo,
      });

      // Respuesta
      response.json({
        success: true,
        message: `Ticket ${ticket.codigo} asignado exitosamente a ${tecnico.nombreCompleto}`,
        data: {
          ticket: resultado.ticketActualizado,
          historial: resultado.historial,
          tecnico: {
            id: tecnico.id,
            nombreCompleto: tecnico.nombreCompleto,
            cargaTrabajo: resultado.cargaTrabajo,
          },
        },
      });
    } catch (error: any) {
      console.error("[BACKEND] Error en asignación manual:", error);
      next(error);
    }
  };
}