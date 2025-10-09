import { usuarios } from "./seeds/usuarios";
import { especialidades } from "./seeds/especialidades";
import { PrismaClient } from "../generated/prisma";

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
