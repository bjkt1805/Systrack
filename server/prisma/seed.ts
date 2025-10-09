import { usuarios } from "./seeds/usuarios";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const main = async () => {
  try {

    //Usuarios - no tiene relaciones
    await prisma.usuario.createMany({
      data: usuarios,

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
