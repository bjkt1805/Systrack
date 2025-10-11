export const categoria = [
  {
    nombre: "Hardware",
    descripcion: "Teclado, monitor, impresora, laptop, CPU, disco duro, mouse. Técnico en reparación de equipos, electrónica básica, mantenimiento preventivo y correctivo.",
    slaId: 1, // Tiempo máximo de respuesta: 4 horas, resolución: 24 horas
  },
  {
    nombre: "Redes y Conectividad",
    descripcion: "Wi-Fi, cableado, VPN, router, firewall. Administrador de redes, soporte en infraestructura, especialista en ciberseguridad.",
    slaId: 2, // Tiempo máximo de respuesta: 1 hora, resolución: 6 horas ----- Mismo SLA que Soporte a Usuario Final
  },
  {
    nombre: "Soporte a Usuario Final",
    descripcion: "Creación de usuario, restablecimiento de contraseña, acceso a correo, directorio activo, instalación de software. Administrador de sistemas, especialista en soporte de aplicaciones empresariales.",
    slaId: 2, // Tiempo máximo de respuesta: 1 hora, resolución: 6 horas ------ Mismo SLA que Redes y Conectividad
  },
  {
    nombre: "Aplicaciones y Sistemas Internos",
    descripcion: "Fallos en ERP, errores en sistema de facturación, actualización de software interno, problemas de base de datos. Desarrollador de software, administrador de bases de datos, soporte de aplicaciones empresariales.",
    slaId: 4, // Tiempo máximo de respuesta: 1 hora, resolución: 12 horas
  },
];
