-- DropForeignKey
ALTER TABLE `historialticket` DROP FOREIGN KEY `HistorialTicket_cambiadoPorId_fkey`;

-- AlterTable
ALTER TABLE `historialticket` MODIFY `cambiadoPorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `HistorialTicket` ADD CONSTRAINT `HistorialTicket_cambiadoPorId_fkey` FOREIGN KEY (`cambiadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
