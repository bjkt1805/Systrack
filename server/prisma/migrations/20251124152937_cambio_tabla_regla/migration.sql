/*
  Warnings:

  - You are about to drop the column `eliminadaAt` on the `regla` table. All the data in the column will be lost.
  - You are about to drop the column `pesoPrioridad` on the `regla` table. All the data in the column will be lost.
  - You are about to drop the column `pesoSlaRestante` on the `regla` table. All the data in the column will be lost.
  - Added the required column `categoriaId` to the `Regla` table without a default value. This is not possible if the table is not empty.
  - Added the required column `especialidadId` to the `Regla` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `regla` DROP COLUMN `eliminadaAt`,
    DROP COLUMN `pesoPrioridad`,
    DROP COLUMN `pesoSlaRestante`,
    ADD COLUMN `aplicaATodasPrioridades` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `categoriaId` INTEGER NOT NULL,
    ADD COLUMN `creadoAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `especialidadId` INTEGER NOT NULL,
    ADD COLUMN `ordenPrioridad` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') NULL,
    MODIFY `pesoCargaTrabajo` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Regla` ADD CONSTRAINT `Regla_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Regla` ADD CONSTRAINT `Regla_especialidadId_fkey` FOREIGN KEY (`especialidadId`) REFERENCES `Especialidad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
