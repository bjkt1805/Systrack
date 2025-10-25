import { EstadoTicket } from "../../generated/prisma";

export const historialTicket = [

  // ========== TICKET 1: RESUELTO ==========
  
  // Historial 1 para el ticket 1 (de null a PENDIENTE)
  {
    ticketId: 1,
    cambiadoPorId: 9,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "La laptop no enciende. Muestra pantalla negra y a veces muestra el Logo de Lenovo, pero no avanza",
    creadoAt: new Date("2025-10-27T08:00:00Z"),
  },

  // Historial 2 para el ticket 1 (de PENDIENTE a ASIGNADO)
  {
    ticketId: 1,
    cambiadoPorId: 1,
    deEstado: EstadoTicket.PENDIENTE,
    aEstado: EstadoTicket.ASIGNADO,
    nota: "Ticket asignado al técnico especializado en hardware",
    creadoAt: new Date("2025-10-27T11:45:00Z"),
  },

  // Historial 3 para el ticket 1 (de ASIGNADO a EN_PROCESO)
  {
    ticketId: 1,
    cambiadoPorId: 6,
    deEstado: EstadoTicket.ASIGNADO,
    aEstado: EstadoTicket.EN_PROCESO,
    nota: "Iniciando diagnóstico del equipo",
    creadoAt: new Date("2025-10-27T12:00:00Z"),
  },

  // Historial 4 para el ticket 1 (de EN_PROCESO a RESUELTO)
  {
    ticketId: 1,
    cambiadoPorId: 6,
    deEstado: EstadoTicket.EN_PROCESO,
    aEstado: EstadoTicket.RESUELTO,
    nota: "Se reemplazó la tarjeta madre defectuosa. El equipo enciende correctamente ahora.",
    creadoAt: new Date("2025-10-27T20:30:00Z"),
  },

  // ========== TICKET 2: ASIGNADO ==========

  // Historial 5 para el ticket 2 (de null a PENDIENTE)
  {
    ticketId: 2,
    cambiadoPorId: 10,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "No puedo conectarme a la VPN de la empresa desde mi casa. Muestra mismo error en dos laptops diferentes.",
    creadoAt: new Date("2025-10-27T08:00:00Z"),
  },

  // Historial 6 para el ticket 2 (de PENDIENTE a ASIGNADO)
  {
    ticketId: 2,
    cambiadoPorId: 1,
    deEstado: EstadoTicket.PENDIENTE,
    aEstado: EstadoTicket.ASIGNADO,
    nota: "Técnico de redes asignado al ticket",
    creadoAt: new Date("2025-10-27T08:30:00Z"),
  },

  // ========== TICKET 3: CERRADO ==========

  // Historial 7 para el ticket 3 (de null a PENDIENTE)
  {
    ticketId: 3,
    cambiadoPorId: 11,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "No puedo emitir facturas desde el ERP. Aparece un error genérico al intentar generar la factura.",
    creadoAt: new Date("2025-10-28T08:10:00Z"),
  },

  // Historial 8 para el ticket 3 (de PENDIENTE a ASIGNADO)
  {
    ticketId: 3,
    cambiadoPorId: 2,
    deEstado: EstadoTicket.PENDIENTE,
    aEstado: EstadoTicket.ASIGNADO,
    nota: "Técnico de aplicaciones asignado al ticket",
    creadoAt: new Date("2025-10-28T09:10:00Z"),
  },

  // Historial 9 para el ticket 3 (de ASIGNADO a EN_PROCESO)
  {
    ticketId: 3,
    cambiadoPorId: 5,
    deEstado: EstadoTicket.ASIGNADO,
    aEstado: EstadoTicket.EN_PROCESO,
    nota: "El técnico está revisando los logs del sistema ERP",
    creadoAt: new Date("2025-10-28T10:00:00Z"),
  },

  // Historial 10 para el ticket 3 (de EN_PROCESO a RESUELTO)
  {
    ticketId: 3,
    cambiadoPorId: 5,
    deEstado: EstadoTicket.EN_PROCESO,
    aEstado: EstadoTicket.RESUELTO,
    nota: "Se corrigió el error en la configuración de facturación. El módulo ya emite facturas correctamente.",
    creadoAt: new Date("2025-10-28T19:15:00Z"),
  },

  // Historial 11 para el ticket 3 (de RESUELTO a CERRADO)
  {
    ticketId: 3,
    cambiadoPorId: 1,
    deEstado: EstadoTicket.RESUELTO,
    aEstado: EstadoTicket.CERRADO,
    nota: "Usuario confirmó que puede emitir facturas sin problemas. Ticket cerrado.",
    creadoAt: new Date("2025-10-29T14:00:00Z"),
  },

  // ========== TICKET 4: RESUELTO ==========

  // Historial 12 para el ticket 4 (de null a PENDIENTE)
  {
    ticketId: 4,
    cambiadoPorId: 12,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "No puedo imprimir documentos de Excel (y otras aplicaciones) desde la impresora de red",
    creadoAt: new Date("2025-10-29T12:20:00Z"),
  }, 

  // Historial 13 para el ticket 4 (de PENDIENTE a ASIGNADO)
  {
    ticketId: 4,
    cambiadoPorId: 1,
    deEstado: EstadoTicket.PENDIENTE,
    aEstado: EstadoTicket.ASIGNADO,
    nota: "Técnico asignado al ticket",
    creadoAt: new Date("2025-10-29T14:30:00Z"),
  }, 

  // Historial 14 para el ticket 4 (de ASIGNADO a EN_PROCESO)
  {
    ticketId: 4,
    cambiadoPorId: 3,
    deEstado: EstadoTicket.ASIGNADO,
    aEstado: EstadoTicket.EN_PROCESO,
    nota: "El técnico está revisando la configuración de la impresora",
    creadoAt: new Date("2025-10-29T15:00:00Z"),
  }, 

  // Historial 15 para el ticket 4 (de EN_PROCESO a RESUELTO)
  {
    ticketId: 4,
    cambiadoPorId: 3,
    deEstado: EstadoTicket.EN_PROCESO,
    aEstado: EstadoTicket.RESUELTO,
    nota: "Se reconfiguró el GPO de impresora para permitir impresión desde aplicaciones de Office",
    creadoAt: new Date("2025-10-29T17:00:00Z"),
  },

  // ========== TICKET 5: EN_PROCESO ==========

  // Historial 16 para el ticket 5 (de null a PENDIENTE)
  {
    ticketId: 5,
    cambiadoPorId: 13,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "Olvidé mi contraseña de correo electrónico y requiero ayuda para restablecerla",
    creadoAt: new Date("2025-10-29T09:00:00Z"),
  },

  // Historial 17 para el ticket 5 (de PENDIENTE a ASIGNADO)
  {
    ticketId: 5,
    cambiadoPorId: 2,
    deEstado: EstadoTicket.PENDIENTE,
    aEstado: EstadoTicket.ASIGNADO,
    nota: "Técnico de soporte asignado al ticket",
    creadoAt: new Date("2025-10-29T09:10:00Z"),
  },

  // Historial 18 para el ticket 5 (de ASIGNADO a EN_PROCESO)
  {
    ticketId: 5,
    cambiadoPorId: 5,
    deEstado: EstadoTicket.ASIGNADO,
    aEstado: EstadoTicket.EN_PROCESO,
    nota: "Verificando identidad del usuario y procediendo con el restablecimiento",
    creadoAt: new Date("2025-10-29T09:15:00Z"),
  },

  // ========== TICKET 6: PENDIENTE ==========

  // Historial 19 para el ticket 6 (de null a PENDIENTE)
  {
    ticketId: 6,
    cambiadoPorId: 14,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "No puedo acceder a Internet desde la oficina. Veo que la computadora está conectada a la red, pero no navega.",
    creadoAt: new Date("2025-10-29T17:29:21Z"),
  },

  // ========== TICKET 7: CERRADO ==========

  // Historial 20 para el ticket 7 (de null a PENDIENTE)
  {
    ticketId: 7,
    cambiadoPorId: 15,
    deEstado: null,
    aEstado: EstadoTicket.PENDIENTE,
    nota: "No puedo acceder a la aplicación de gestión de proyectos.",
    creadoAt: new Date("2025-10-28T10:00:00Z"),
  },

  // Historial 21 para el ticket 7 (de PENDIENTE a ASIGNADO)
  {
    ticketId: 7,
    cambiadoPorId: 2,
    deEstado: EstadoTicket.PENDIENTE,
    aEstado: EstadoTicket.ASIGNADO,
    nota: "Técnico asignado al ticket",
    creadoAt: new Date("2025-10-28T11:00:00Z"),
  },

  // Historial 22 para el ticket 7 (de ASIGNADO a EN_PROCESO)
  {
    ticketId: 7,
    cambiadoPorId: 5,
    deEstado: EstadoTicket.ASIGNADO,
    aEstado: EstadoTicket.EN_PROCESO,
    nota: "Iniciando actualización del sistema interno",
    creadoAt: new Date("2025-10-28T15:12:00Z"),
  },

  // Historial 23 para el ticket 7 (de EN_PROCESO a RESUELTO)
  {
    ticketId: 7,
    cambiadoPorId: 5,
    deEstado: EstadoTicket.EN_PROCESO,
    aEstado: EstadoTicket.RESUELTO,
    nota: "Actualización completada exitosamente. El sistema está funcionando correctamente.",
    creadoAt: new Date("2025-10-28T17:23:00Z"),
  },

  // Historial 24 para el ticket 7 (de RESUELTO a CERRADO)
  {
    ticketId: 7,
    cambiadoPorId: 15,
    deEstado: EstadoTicket.RESUELTO,
    aEstado: EstadoTicket.CERRADO,
    nota: "Sistema actualizado y funcionando correctamente. Gracias por el soporte.",
    creadoAt: new Date("2025-10-29T13:00:00Z"),
  },
];