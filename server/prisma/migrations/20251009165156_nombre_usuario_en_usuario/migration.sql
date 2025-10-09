/*
  Warnings:

  - A unique constraint covering the columns `[nombreUsuario]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nombreUsuario` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `nombreUsuario` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_nombreUsuario_key` ON `Usuario`(`nombreUsuario`);
