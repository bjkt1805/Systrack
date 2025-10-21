import { usuarios } from "./seeds/usuarios";
import { especialidades } from "./seeds/especialidades";
import { Prisma, PrismaClient } from "../generated/prisma";
import { categoria } from "./seeds/categoria";
import { SLA } from "./seeds/SLA";
import { ticket } from "./seeds/ticket";
import { etiquetas } from "./seeds/etiquetas";
import { historialTicket } from "./seeds/historialTicket";
import { imagenTicket } from "./seeds/imagenTicket";

const prisma = new PrismaClient();
const main = async () => {
  try {

    // Especialidades - createMany (crear varios registros sin registrar relaciones)
    await prisma.especialidad.createMany({
      data: especialidades,

      // Respetar campo unique (nombre)
      skipDuplicates: true,
    });

    //Usuarios - createMany (crear varios registros sin registrar relaciones)
    await prisma.usuario.createMany({
      data: usuarios,

      // Respetar campo unique (email)
      skipDuplicates: true,
    });

    // Etiquetas - createMany (crear varios registros sin registrar relaciones)
    await prisma.etiqueta.createMany({
      data: etiquetas,

      // Respetar campo unique (nombre)
      skipDuplicates: true,
    });

    // Sla - createMany (crear varios registros sin registrar relaciones) -- Se tienen que insertar primero los SLA porque las categorías dependen de ellos
    await prisma.sLA.createMany({
      data: SLA,

      // Respetar campo unique
      skipDuplicates: true,
    });

    // Categorias - createMany (crear varios registros sin registrar relaciones)
    await prisma.categoria.createMany({
      data: categoria,

      // Respetar campo unique
      skipDuplicates: true,
    });

    // Ticket - createMany (crear varios registros sin registrar relaciones)
    await prisma.ticket.createMany({
      data: ticket,

      // Respetar campo unique
      skipDuplicates: true,
    });

    // Historial Ticket - createMany (crear varios registros sin registrar relaciones)
    await prisma.historialTicket.createMany({
      data: historialTicket,

      // Respetar campo unique
      skipDuplicates: true,
    });

    // Imagen Ticket - createMany (crear varios registros sin registrar relaciones)
    await prisma.imagenTicket.createMany({
      data: imagenTicket,

      // Respetar campo unique
      skipDuplicates: true,
    });

    // MAPEO MUCHOS A MUCHOS ENTRE TÉCNICOS Y ESPECIALIDADES

    // Actualizar el Técnico 1 (id de usuario 3) creado con sus especialidades
    await prisma.usuario.update({
      where: { id: 3 },
      data: {
        especialidades: {
          connect: [
            { id: 1 }, // Conectar con la especialidad de Redes
            { id: 2 }, // Conectar con la especialidad de Mantenimiento preventivo y correctivo
            { id: 3 }, // Conectar con la especialidad de Soporte en infraestructura
          ],
        },
      },
    });

    // Actualizar el Técnico 2 (id de usuario 4) creado con sus especialidades
    await prisma.usuario.update({
      where: { id: 4 },
      data: {
        especialidades: {
          connect: [
            { id: 4 }, // Conectar con la especialidad de Administrador de redes
            { id: 5 }, // Conectar con la especialidad de Electrónica básica
            { id: 6 }, // Conectar con la especialidad de Administrador de sistemas
          ],
        },
      },
    });

    // Actualizar el Técnico 3 (id de usuario 5) creado con sus especialidades
    await prisma.usuario.update({
      where: { id: 5 },
      data: {
        especialidades: {
          connect: [
            { id: 1 }, // Conectar con la especialidad de Redes
            { id: 2 }, // Conectar con la especialidad de Mantenimiento preventivo y correctivo
            { id: 3 }, // Conectar con la especialidad de Soporte en infraestructura
          ],
        },
      },
    });

    // Actualizar el Técnico 4 (id de usuario 6) creado con sus especialidades
    await prisma.usuario.update({
      where: { id: 6 },
      data: {
        especialidades: {
          connect: [
            { id: 4 }, // Conectar con la especialidad de Administrador de redes
            { id: 5 }, // Conectar con la especialidad de Electrónica básica
            { id: 6 }, // Conectar con la especialidad de Administrador de sistemas
          ],
        },
      },
    });

    // Actualizar el Técnico 5 (id de usuario 7) creado con sus especialidades
    await prisma.usuario.update({
      where: { id: 7 },
      data: {
        especialidades: {
          connect: [
            { id: 1 }, // Conectar con la especialidad de Redes
            { id: 2 }, // Conectar con la especialidad de Mantenimiento preventivo y correctivo
            { id: 3 }, // Conectar con la especialidad de Soporte en infraestructura
          ],
        },
      },
    });

    // Actualizar el Técnico 6 (id de usuario 8) creado con sus especialidades
    await prisma.usuario.update({
      where: { id: 8 },
      data: {
        especialidades: {
          connect: [
            { id: 4 }, // Conectar con la especialidad de Administrador de redes
            { id: 5 }, // Conectar con la especialidad de Electrónica básica
            { id: 6 }, // Conectar con la especialidad de Administrador de sistemas
          ],
        },
      },
    });

    // MAPEO MUCHOS A MUCHOS ENTRE CATEGORIAS Y ETIQUETAS

    // Actualizar la Categoría 1 creada con sus etiquetas
    await prisma.categoria.update({
      where: { id: 1 },
      data: {
        etiquetas: {
          connect: [
            { id: 1 }, // Conectar con la etiqueta Laptop
            { id: 2 }, // Conectar con la etiqueta Monitor
            { id: 3 }, // Conectar con la etiqueta Teclado
            { id: 4 }, // Conectar con la etiqueta Mouse
            { id: 5 }, // Conectar con la etiqueta CPU
            { id: 6 }, // Conectar con la etiqueta Impresora
            { id: 7 }, // Conectar con la etiqueta Disco duro
            { id: 8 }, // Conectar con la etiqueta Fuente de poder
            { id: 9 }, // Conectar con la etiqueta Reparación de componentes
            { id: 10 }, // Conectar con la etiqueta Mantenimiento preventivo
            { id: 11 }, // Conectar con la etiqueta Mantenimiento correctivo
            { id: 12 }, // Conectar con la etiqueta Instalación de hardware
            { id: 13 }, // Conectar con la etiqueta Diagnóstico de fallas
          ],
        },
      },
    });

    // Actualizar la Categoría 2 creada con sus etiquetas
    await prisma.categoria.update({
      where: { id: 2 },
      data: {
        etiquetas: {
          connect: [
            { id: 14 }, // Conectar con la etiqueta Wi-Fi
            { id: 15 }, // Conectar con la etiqueta VPN
            { id: 16 }, // Conectar con la etiqueta Router
            { id: 17 }, // Conectar con la etiqueta Switch
            { id: 18 }, // Conectar con la etiqueta Cableado estructurado
            { id: 19 }, // Conectar con la etiqueta Firewall
            { id: 20 }, // Conectar con la etiqueta Conexión lenta
            { id: 21 }, // Conectar con la etiqueta Sin acceso a Internet
            { id: 22 }, // Conectar con la etiqueta Configuración IP
            { id: 23 }, // Conectar con la etiqueta Ciberseguridad
            { id: 24 }, // Conectar con la etiqueta Ancho de banda
            { id: 25 }, // Conectar con la etiqueta DNS
            { id: 26 }, // Conectar con la etiqueta Servidores de red
          ],
        },
      },
    });

    // Actualizar la Categoría 3 creada con sus etiquetas
    await prisma.categoria.update({
      where: { id: 3 },
      data: {
        etiquetas: {
          connect: [
            { id: 27 }, // Conectar con la etiqueta Restablecimiento de contraseña
            { id: 28 }, // Conectar con la etiqueta Correo electrónico
            { id: 29 }, // Conectar con la etiqueta Acceso denegado
            { id: 30 }, // Conectar con la etiqueta Instalación de software
            { id: 31 }, // Conectar con la etiqueta Actualización de software
            { id: 32 }, // Conectar con la etiqueta Creación de usuario
            { id: 33 }, // Conectar con la etiqueta Directorios activos
            { id: 34 }, // Conectar con la etiqueta Soporte remoto
            { id: 35 }, // Conectar con la etiqueta Outlook
            { id: 36 }, // Conectar con la etiqueta Microsoft Teams
            { id: 37 }, // Conectar con la etiqueta Zoom
            { id: 38 }, // Conectar con la etiqueta Office 365
            { id: 39 }, // Conectar con la etiqueta Software no responde
          ],
        },
      },
    });

    // Actualizar la Categoría 4 creada con sus etiquetas
    await prisma.categoria.update({
      where: { id: 4 },
      data: {
        etiquetas: {
          connect: [
            { id: 40 }, // Conectar con la etiqueta ERP
            { id: 41 }, // Conectar con la etiqueta Sistema de facturación
            { id: 42 }, // Conectar con la etiqueta Base de datos
            { id: 43 }, // Conectar con la etiqueta Actualización de sistema
            { id: 42 }, // Conectar con la etiqueta Error de aplicación
            { id: 43 }, // Conectar con la etiqueta Desarrollo de software
            { id: 44 }, // Conectar con la etiqueta Bug interno
            { id: 43 }, // Conectar con la etiqueta Integración de sistemas
            { id: 44 }, // Conectar con la etiqueta SQL
            { id: 45 }, // Conectar con la etiqueta API
            { id: 46 }, // Conectar con la etiqueta Soporte a aplicaciones
            { id: 47 }, // Conectar con la etiqueta Optimización de rendimiento
          ],
        },
      },
    });

    // MAPEO MUCHOS A MUCHOS ENTRE CATEGORIAS Y ESPECIALIDADES

    // Actualizar la Categoría 1 Hardware creada con sus especialidades
    await prisma.categoria.update({
      where: { id: 1 },
      data: {
        especialidades: {
          connect: [
            { id: 1 }, // Conectar con la especialidad de Técnico en reparación de equipos electrónicos
            { id: 2 }, // Conectar con la especialidad de Técnico en mantenimiento de hardware
            { id: 3 }, // Conectar con la especialidad de Técnico en instalación de redes
          ],
        },
      },
    });

    // Actualizar la Categoría 2 Redes y Conectividad creada con sus especialidades
    await prisma.categoria.update({
      where: { id: 2 },
      data: {
        especialidades: {
          connect: [
            { id: 4 }, // Conectar con la especialidad de Técnico en redes y conectividad
            { id: 5 }, // Conectar con la especialidad de Técnico en seguridad informática
            { id: 6 }, // Conectar con la especialidad de Técnico en administración de sistemas
          ],
        },
      },
    });

    // Actualizar la Categoría 3 Soporte a usuario final creada con sus especialidades
    await prisma.categoria.update({
      where: { id: 3 },
      data: {
        especialidades: {
          connect: [
            { id: 7 }, // Conectar con la especialidad de Técnico en administración de sistemas
            { id: 8 }, // Conectar con la especialidad de Técnico en soporte de aplicaciones empresariales
          ],
        },
      },
    });

    // Actualizar la Categoría 4 Aplicaciones y sistemas internos creada con sus especialidades
    await prisma.categoria.update({
      where: { id: 4 },
      data: {
        especialidades: {
          connect: [
            { id: 9 }, // Conectar con la especialidad de Desarrollador de software
            { id: 10 }, // Conectar con la especialidad de Técnico en bases de datos
          ],
        },
      },
    });

    // MAPEO 1:1 ENTRE IMAGEN TICKET E HISTORIAL TICKET (ASIGNAR IMAGEN AL HISTORIAL CORRESPONDIENTE)

    // Actualizar Imagen Ticket 1 creado con su historial
    await prisma.imagenTicket.update({
      where: { id: 1 },
      data: {
        historial: {
          connect: { id: 1 }, // Conectar con el historialTicket id 1
        },
      },
    });

    // MAPEO 1:1 ENTRE HISTORIAL TICKET Y TICKET (ASIGNAR HISTORIAL AL TICKET CORRESPONDIENTE)

    // Actualizar el Ticket 1 creado con su historial
    await prisma.ticket.update({
      where: { id: 1 },
      data: {
        historiales: {
          connect: { id: 1 }, // Conectar con el historialTicket id 1
        },
      },
    });

  } catch (error) {
    throw error;
  }
};

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("Error en seed:", e);
    await prisma.$disconnect()
  })
