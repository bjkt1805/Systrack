import { EstadoTicket } from "../../generated/prisma";

export const historialTicket = [

  // Historial 1 para el ticket 1 (de null a PENDIENTE)
  {
    ticketId: 1,
    cambiadoPorId: 9,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "La laptop no enciende. Muestra pantalla negra y a veces muestra el Logo de Lenovo, pero no avanza",
  },

  // Historial 2 para el ticket 2 (de null a PENDIENTE)
  {
    ticketId: 2,
    cambiadoPorId: 10,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "No puedo conectarme a la VPN de la empresa desde mi casa. Muestra mismo error en dos laptops diferentes.",
  },

  // Historial 3 para el ticket 2 (de PENDIENTE a ASIGNADO)
  {
    ticketId: 2,
    cambiadoPorId: 1,
    deEstado: EstadoTicket.PENDIENTE,
    aEstado: EstadoTicket.ASIGNADO,
    nota: "Técnico asignado al ticket",
  },

  // Historial 4 para el ticket 3 (de null a PENDIENTE)
  {
    ticketId: 3,
    cambiadoPorId: 11,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "No puedo emitir facturas desde el ERP. Aparece un error genérico al intentar generar la factura.",
  },

  // Historial 5 para el ticket 3 (de PENDIENTE a ASIGNADO)
  {
    ticketId: 3,
    cambiadoPorId: 2,
    deEstado: EstadoTicket.PENDIENTE,
    aEstado: EstadoTicket.ASIGNADO,
    nota: "Técnico asignado al ticket",
  },

  // Historial 6 para el ticket 3 (de ASIGNADO a EN_PROCESO)
  {
    ticketId: 3,
    cambiadoPorId: 4,
    deEstado: EstadoTicket.ASIGNADO,
    aEstado: EstadoTicket.EN_PROCESO,
    nota: "El técnico asignado está trabajando en el ticket",
  },

  // Historial 7 para el ticket 4 (de null a PENDIENTE)
  {
    ticketId: 4,
    cambiadoPorId: 12,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "No puedo imprimir documentos de Excel (y otras aplicaciones) desde la impresora de red"
  }, 

  // Historial 8 para el ticket 4 (de PENDIENTE a ASIGNADO)
  {
    ticketId: 4,
    cambiadoPorId: 1,
    deEstado: EstadoTicket.PENDIENTE,
    aEstado: EstadoTicket.ASIGNADO,
    nota: "Técnico asignado al ticket",
  }, 

  // Historial 9 para el ticket 4 (de ASIGNADO a EN_PROCESO)
  {
    ticketId: 4,
    cambiadoPorId: 5,
    deEstado: EstadoTicket.ASIGNADO,
    aEstado: EstadoTicket.EN_PROCESO,
    nota: "El técnico asignado está trabajando en el ticket",
  }, 

  // Historial 10 para el ticket 4 (de EN_PROCESO a RESUELTO)
  {
    ticketId: 4,
    cambiadoPorId: 5,
    deEstado: EstadoTicket.EN_PROCESO,
    aEstado: EstadoTicket.RESUELTO,
    nota: "Se reconfiguró el GPO de impresora para permitir impresión desde aplicaciones de Office",
  },

  // Historial 11 para el ticket 5 (de null a PENDIENTE)
  {
    ticketId: 5,
    cambiadoPorId: 13,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "Olvidé mi contraseña de correo electrónico y requiero ayuda para restablecerla",
  },

  // Historial 12 para el ticket 5 (de PENDIENTE a ASIGNADO)
  {
    ticketId: 5,
    cambiadoPorId: 2,
    deEstado: EstadoTicket.PENDIENTE,
    aEstado: EstadoTicket.ASIGNADO,
    nota: "Técnico asignado al ticket",
  },

  // Historial 13 para el ticket 5 (de ASIGNADO a EN_PROCESO)
  {
    ticketId: 5,
    cambiadoPorId: 3,
    deEstado: EstadoTicket.ASIGNADO,
    aEstado: EstadoTicket.EN_PROCESO,
    nota: "El técnico asignado está trabajando en el ticket",
  },

  // Historial 14 para el ticket 5 (de EN_PROCESO a RESUELTO)
  {
    ticketId: 5,
    cambiadoPorId: 3,
    deEstado: EstadoTicket.EN_PROCESO,
    aEstado: EstadoTicket.RESUELTO,
    nota: "Se restableció la contraseña y se envió al usuario de forma segura",
  },

  // Historial 15 para el ticket 5 (de RESUELTO a CERRADO)
  {
    ticketId: 5,
    cambiadoPorId: 13,
    deEstado: EstadoTicket.RESUELTO,
    aEstado: EstadoTicket.CERRADO,
    nota: "La solución sirve sin problemas. Solicito cierre del ticket. Gracias.",
  },

  // Historial 16 para el ticket 6 (de null a PENDIENTE)
  {
    ticketId: 6,
    cambiadoPorId: 14,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "No puedo acceder a Internet desde la oficina. Veo que la computadora está conectada a la red, pero no navega.",
  },

  // Historial 17 para el ticket 7 (de null a PENDIENTE)
  {
    ticketId: 7,
    cambiadoPorId: 15,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "No puedo acceder a la aplicación de gestión de proyectos.",
  },

  // Historial 18 para el ticket 7 (de PENDIENTE a ASIGNADO)
  {
    ticketId: 7,
    cambiadoPorId: 2,
    deEstado: EstadoTicket.PENDIENTE,
    aEstado: EstadoTicket.ASIGNADO,
    nota: "Técnico asignado al ticket",
  },
];