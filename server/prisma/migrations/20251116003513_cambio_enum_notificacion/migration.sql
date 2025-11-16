/*
  Warnings:

  - You are about to alter the column `estado` on the `notificacion` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `Enum(EnumId(8))`.

*/
-- AlterTable
ALTER TABLE `notificacion` MODIFY `estado` ENUM('LEIDA', 'NO_LEIDA') NOT NULL DEFAULT 'NO_LEIDA';
