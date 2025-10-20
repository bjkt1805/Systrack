export enum Rol {
  ADMIN = 'ADMIN',
  TECNICO = 'TECNICO',
  CLIENTE = 'CLIENTE',
}

export enum EstadoTicket {
  PENDIENTE = 'PENDIENTE',
  ASIGNADO = 'ASIGNADO',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO = 'RESUELTO',
  CERRADO = 'CERRADO',
}

export enum Prioridad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export enum MetodoAsignacion {
  AUTOMATICA = 'AUTOMATICA',
  MANUAL = 'MANUAL',
}

export enum TipoNotificacion {
  TICKET_ASIGNADO = 'TICKET_ASIGNADO',
  ESTADO_CAMBIADO = 'ESTADO_CAMBIADO',
  NUEVA_OBSERVACION = 'NUEVA_OBSERVACION',
  INICIO_SESION = 'INICIO_SESION',
}

export enum EstadoNotificacion {
  PENDIENTE = 'PENDIENTE',
  ATENDIDA = 'ATENDIDA',
}

export enum EstadoTecnico {
  DISPONIBLE = 'DISPONIBLE',
  NO_DISPONIBLE = 'NO DISPONIBLE',
  DESCONECTADO = 'DESCONECTADO',
}