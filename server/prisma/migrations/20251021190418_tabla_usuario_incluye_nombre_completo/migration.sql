/*
  Warnings:

  - Added the required column `nombreCompleto` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `nombreCompleto` VARCHAR(191) NOT NULL,
    ADD COLUMN `telefono` VARCHAR(191) NULL;
