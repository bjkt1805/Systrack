import {Request, Response, NextFunction} from 'express';
import {Prioridad, PrismaClient, Regla, Ticket, Usuario} from '../../generated/prisma';
import {AppError} from '../errors/custom.error';

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
    };
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
    getPesoPrioridad= (prioridad: Prioridad): number => {

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
            where: {id: tecnicoId, rol: 'TECNICO'},
            include:{
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
        tecnicoP: Usuario,
        regla: Regla,
        slaRestante: number,
        pesoPrioridad: number): Promise<string> => {

        const tecnico = await this.getTecnicoById(tecnicoP.id);

        return `
            Ticket ${ticketP.codigo} asignado a ${tecnico.nombreCompleto}

            CRITERIOS DE ASIGNACIÓN:
            - Categoría Id: ${ticketP.categoriaId}
            - Prioridad: ${ticketP.prioridad} (peso: ${pesoPrioridad})
            - SLA restante: ${slaRestante.toFixed(2)} horas
            - Regla aplicada: ${regla.nombre}

            TÉCNICO SELECCIONADO:
            - Nombre: ${tecnico.nombreCompleto}
            - Especialidades: ${tecnico.especialidades.join(', ')}
            - Carga actual: ${tecnico.cargaTrabajo} tickets

            CÁLCULO:
            Puntaje = (Prioridad × 1000) - SLA restante - (Carga × 50)
            Puntaje = (${pesoPrioridad} × 1000) - ${slaRestante.toFixed(2)} - (${tecnicoP.cargaTrabajo} × 50)
            `

    }

    /**
     * Método POST para iniciar la autoasignación del ticket 
     * al técnico más adecuado según las reglas definidas
     * 
     */
    autoAsignarTicket = async (req: Request, res: Response,next: NextFunction) => {
        
        const ticketId = parseInt(req.params.id,10);
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

            // Validar si el ticket existe, si no devolver error
            if(!ticket){
                return next(AppError.notFound('Ticket no encontrado'));
            }

            // Calcular el tiempoRestante del SLA de resolucion del tiquete
            const ahora = new Date();
            const fechaLimite = new Date(ticket.fechaLimiteResolucion); // Cast a Date

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

            // Obtener las especialidades requeridas de la categoria del tiquete
            const especialidadesRequeridas = ticket.categoria.especialidades.map(esp => esp.id);

            // Buscar las reglas aplicables a la categoria
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
            if(reglasAplicables.length === 0){
                return res.status(400).json({
                    success: false,
                    error: "No hay reglas de asignación aplicables para este ticket. Se requiere asignación manual."
                });
            }

            // Debuguear las reglas aplicables al tiquete 
            console.log(`[AUTO-ASIGNACIÓN] Reglas aplicables para el ticket ${ticket.codigo}:`, reglasAplicables);

            // Variable para guardar el mejor técnico disponible 
            let mejorTecnico: TecnicoPuntuado | null = null; 

            // Recorrer la lista de reglas y obtener la lista de técnicos potenciales
            for (const regla of reglasAplicables) {

                console.log(`[AUTO-ASIGNACIÓN] Evaluación de regla: ${regla.nombre}`);

                // Buscar los técnicos que tengan la especialidad requerida en la regla
                const tecnicosPotenciales = await this.prisma.usuario.findMany({
                    
                    // Filtrar las especialidades del técnico que coincidan con la de la regla
                    // mediante el operador some
                    where: { 
                        rol: 'TECNICO',
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
                                    in: ['PENDIENTE', 'ASIGNADO', 'EN_PROCESO']
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
                if(tecnicosFiltrados.length === 0){
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
                    const tecnicoSeleccionado = tecnicosPuntuados.sort((a,b) => b.puntajeTecnico - a.puntajeTecnico)[0];

                    // Si la variable mejorTecnico es nula o el puntaje del tecnico Seleccionado 
                    // es mayor al puntaje de mejorTecnico, asignarle a mejorTecnico el valor de tecnicoSeleccionado
                    // if (!mejorTecnico || tecnicoSeleccionado.puntajeTecnico > mejorTecnico.puntajeTecnico) {
                    //     mejorTecnico = tecnicoSeleccionado;
                    //     mejorTecnico.reglaAplicada = regla;

                    //     // Mostrar en consola el mejor tecnico
                    //     console.log(`[AUTO-ASIGNACIÓN] Nuevo mejor técnico seleccionado:`, mejorTecnico);
                    // }

                    break; // salir del ciclo de reglas una vez se encuentra un técnico adecuado
                }

            }

         catch (error: any) {
            throw error;
        }
    }

    

}