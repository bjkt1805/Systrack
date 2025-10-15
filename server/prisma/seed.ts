import { usuarios } from "./seeds/usuarios";
import { especialidades } from "./seeds/especialidades";
import { PrismaClient } from "../generated/prisma";
import { categoria } from "./seeds/categoria";
import { SLA } from "./seeds/sla";
import { ticket } from "./seeds/ticket";

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

    // Mapeo N a N entre técnicos y especialidades




    // Sla - createMany (crear varios registros sin registrar relaciones) -- Se tienen que insertar primero los SLA porque las categorías dependen de ellos
    await prisma.sLA.createMany({
      data: SLA,

      // Respetar campo unique (email)
      skipDuplicates: true,
    });

    // Categorias - createMany (crear varios registros sin registrar relaciones)
    await prisma.categoria.createMany({
      data: categoria,

      // Respetar campo unique (email)
      skipDuplicates: true,
    });


    // Ticket - createMany (crear varios registros sin registrar relaciones)
    await prisma.ticket.createMany({
      data: ticket,

      // Respetar campo unique (email)
      skipDuplicates: true,
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
