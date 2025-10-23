export const categoria = [
  {
    nombre: "Hardware",
    descripcion: "Teclado, monitor, impresora, laptop, CPU, disco duro, mouse...",
    slaId: 1, // Tiempo máximo de respuesta: 4 horas, resolución: 24 horas
  },
  {
    nombre: "Redes y Conectividad",
    descripcion: "Wi-Fi, cableado, VPN, router, firewall. Administrador de redes.",
    slaId: 2, // Tiempo máximo de respuesta: 1 hora, resolución: 6 horas ----- Mismo SLA que Soporte a Usuario Final
  },
  {
    nombre: "Soporte a Usuario Final",
    descripcion: "Creación de usuario, restablecimiento de contraseña, acceso a correo, directorio activo, instalación de software.",
    slaId: 2, // Tiempo máximo de respuesta: 1 hora, resolución: 6 horas ------ Mismo SLA que Redes y Conectividad
  },
  {
    nombre: "Aplicaciones y Sistemas Internos",
    descripcion: "Fallos en ERP, errores en sistema de facturación, actualización de software interno, problemas de base de datos.",
    slaId: 3, // Tiempo máximo de respuesta: 1 hora, resolución: 12 horas
  },
];
