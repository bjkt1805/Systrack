import { EstadoTicket, Prioridad } from "../../generated/prisma";


// Los solicitantes de los tiquetes solo pueden ser usuarios con rol CLIENTE
export const ticket = [

  // Ticket id : 1
  {
    codigo: "INC-2025-0001",
    titulo: "Laptop no enciende",
    descripcion: "El equipo no responde al botón de encendido.",
    estado: EstadoTicket.RESUELTO,
    prioridad: Prioridad.ALTA,
    solicitanteId: 9,
    categoriaId: 1,
    usuarioAsignadoId: 6,
    creadoAt: new Date("2025-10-27T08:00:00Z"),               // 02:00 hora de CR 
    fechaLimiteRespuesta: new Date("2025-10-27T12:00:00Z"),   // 06:00 hora de CR (240 min = 4 horas)
    fechaLimiteResolucion: new Date("2025-10-28T08:00:00Z"),  // 02:00 hora de CR del día siguiente (1440 min = 24 horas)
    respondidoAt: new Date("2025-10-27T11:45:00Z"),
    resueltoAt: new Date("2025-10-28T07:30:00Z"),             // 01:30 hora de CR del día siguiente, dentro del límite
    cerradoAt: null,
    cerradoPorId: null,
    cumplioRespuesta: true,
    cumplioResolucion: true,
  },

  // Ticket id : 2
  {
    codigo: "INC-2025-0002",
    titulo: "Sin acceso a VPN",
    descripcion: "No puedo conectarme a la VPN de la empresa.",
    estado: EstadoTicket.ASIGNADO,
    prioridad: Prioridad.MEDIA,
    solicitanteId: 10,
    categoriaId: 2,
    usuarioAsignadoId: 4,
    creadoAt: new Date("2025-10-27T08:00:00Z"),              // 02:00 hora de CR
    fechaLimiteRespuesta: new Date("2025-10-27T09:00:00Z"),  // 03:00 hora de CR (60 min = 1 hora)
    fechaLimiteResolucion: new Date("2025-10-27T14:00:00Z"), // 08:00 hora de CR (360 min = 6 horas)
    respondidoAt: new Date("2025-10-27T08:30:00Z"),          // dentro del plazo = cumplió respuesta
    resueltoAt: null,
    cerradoAt: null,
    cerradoPorId: null,
    cumplioRespuesta: true,
    cumplioResolucion: null,
  },

  // Ticket id : 3
  {
    codigo: "INC-2025-0003",
    titulo: "Error en sistema de facturación",
    descripcion: "No se puede emitir facturas desde el ERP.",
    estado: EstadoTicket.CERRADO,
    prioridad: Prioridad.URGENTE,
    solicitanteId: 11,
    categoriaId: 4,
    usuarioAsignadoId: 5,
    creadoAt: new Date("2025-10-28T08:10:00Z"),              // 02:10 hora de CR
    fechaLimiteRespuesta: new Date("2025-10-28T09:10:00Z"),  // 03:10 hora de CR (60 min = 1 hora)
    fechaLimiteResolucion: new Date("2025-10-28T20:10:00Z"), // 14:10 hora de CR (720 min = 12 horas)
    respondidoAt: new Date("2025-10-28T09:10:00Z"),          // en el límite → cumple
    resueltoAt: new Date("2025-10-28T19:15:00Z"),            // antes del límite → cumple -- 1:15 pm hora de CR
    cerradoAt: new Date("2025-10-29T14:00:00Z"),             // 8:00 hora de CR
    cerradoPorId: 1,
    cumplioRespuesta: true,
    cumplioResolucion: true,
  },

  // Ticket id : 4
  {
    codigo: "INC-2025-0004",
    titulo: "Problema con impresora",
    descripcion: "La impresora no imprime documentos.",
    estado: EstadoTicket.RESUELTO,
    prioridad: Prioridad.BAJA,
    solicitanteId: 12,
    categoriaId: 1,
    usuarioAsignadoId: 3,
    creadoAt: new Date("2025-10-29T12:20:00Z"),               // 06:20 hora de CR
    fechaLimiteRespuesta: new Date("2025-10-29T16:20:00Z"),   // 10:20 hora de CR (240 min = 4 horas)
    fechaLimiteResolucion: new Date("2025-10-30T12:20:00Z"),  // 06:20 hora de CR (1440 min = 24 horas)
    respondidoAt: new Date("2025-10-29T14:30:00Z"),        // dentro del plazo
    resueltoAt: new Date("2025-10-29T17:00:00Z"),             // antes del límite
    cerradoAt: null,
    cerradoPorId: null,
    cumplioRespuesta: true,
    cumplioResolucion: true,
  },

  // Ticket id : 5
  {
    codigo: "INC-2025-0005",
    titulo: "Restablecimiento de contraseña",
    descripcion: "Solicito restablecer mi contraseña de correo.",
    estado: EstadoTicket.EN_PROCESO,
    prioridad: Prioridad.MEDIA,
    solicitanteId: 13,
    categoriaId: 3,
    usuarioAsignadoId: 5,
    creadoAt: new Date("2025-10-29T09:00:00Z"),               // 03:00 hora de CR
    fechaLimiteRespuesta: new Date("2025-10-29T10:00:00Z"),   // 04:00 hora de CR (60 min = 1 hora)
    fechaLimiteResolucion: new Date("2025-10-29T15:00:00Z"),  // 09:00 hora de CR (360 min = 6 horas)
    respondidoAt: new Date("2025-10-29T09:10:00Z"),           // 03:10 hora de CR -> dentro del plazo
    resueltoAt: null,             
    cerradoAt: null,              
    cerradoPorId: null,
    cumplioRespuesta: true,
    cumplioResolucion: null,
  },

  // Ticket id : 6
  {
    codigo: "INC-2025-0006",
    titulo: "Problema de red",
    descripcion: "No hay conexión a internet en la oficina.",
    estado: EstadoTicket.PENDIENTE,
    prioridad: Prioridad.URGENTE,
    solicitanteId: 14,
    categoriaId: 2,
    usuarioAsignadoId: null,
    creadoAt: new Date("2025-10-29T17:29:21Z"),              // 11:29 hora de CR
    fechaLimiteRespuesta: new Date("2025-10-29T18:29:21Z"),   // 12:29 hora de CR (60 min = 1 hora)
    fechaLimiteResolucion: new Date("2025-10-29T23:29:21Z"),  // 17:29 hora de CR (360 min = 6 horas)
    respondidoAt: null,
    resueltoAt: null,
    cerradoAt: null,
    cerradoPorId: null,
    cumplioRespuesta: null,
    cumplioResolucion: null,
  },

  // Ticket id : 7
  {
    codigo: "INC-2025-0007",
    titulo: "Actualización de software",
    descripcion: "Solicito actualización de sistema interno.",
    estado: EstadoTicket.CERRADO,
    prioridad: Prioridad.BAJA,
    solicitanteId: 15,
    categoriaId: 4,
    usuarioAsignadoId: 5,
    creadoAt: new Date("2025-10-28T10:00:00Z"),
    fechaLimiteRespuesta: new Date("2025-10-28T11:00:00Z"),   // 05:00 hora de CR (60 min = 1 hora)
    fechaLimiteResolucion: new Date("2025-10-28T22:00:00Z"),  // 16:00 hora de CR (720 min = 12 horas)
    respondidoAt: new Date("2025-10-28T10:50:00Z"),            // 09:12 hora de CR -> dentro del plazo
    resueltoAt: new Date("2025-10-28T17:23:00Z"),             // 11:23 hora de CR -> dentro del plazo
    cerradoAt: new Date("2025-10-29T13:00:00Z"),              // 07:00 hora de CR -> dentro del plazo
    cerradoPorId: 15,
    cumplioRespuesta: true,
    cumplioResolucion: true,
  },
];