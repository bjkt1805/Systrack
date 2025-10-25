-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreUsuario` VARCHAR(191) NOT NULL,
    `nombreCompleto` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `correo` VARCHAR(191) NOT NULL,
    `contrasenaHash` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'TECNICO', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
    `foto` VARCHAR(191) NULL DEFAULT 'image-not-found.jpg',
    `ultimoIngresoAt` DATETIME(3) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `estadoTecnico` ENUM('DISPONIBLE', 'NO_DISPONIBLE', 'DESCONECTADO') NULL,
    `cargaTrabajo` INTEGER NULL DEFAULT 0,
    `creadoAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Usuario_nombreUsuario_key`(`nombreUsuario`),
    UNIQUE INDEX `Usuario_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Especialidad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,

    UNIQUE INDEX `Especialidad_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SLA` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `maxMinutosRespuesta` INTEGER NOT NULL,
    `maxMinutosResolucion` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `SLA_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `slaId` INTEGER NOT NULL,
    `creadoAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Categoria_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Etiqueta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Etiqueta_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(32) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `estado` ENUM('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO') NOT NULL DEFAULT 'PENDIENTE',
    `prioridad` ENUM('BAJA', 'MEDIA', 'ALTA', 'URGENTE') NOT NULL DEFAULT 'MEDIA',
    `solicitanteId` INTEGER NOT NULL,
    `categoriaId` INTEGER NOT NULL,
    `usuarioAsignadoId` INTEGER NULL,
    `fechaLimiteRespuesta` DATETIME(3) NOT NULL,
    `fechaLimiteResolucion` DATETIME(3) NOT NULL,
    `respondidoAt` DATETIME(3) NULL,
    `resueltoAt` DATETIME(3) NULL,
    `cerradoAt` DATETIME(3) NULL,
    `cerradoPorId` INTEGER NULL,
    `cumplioRespuesta` BOOLEAN NULL,
    `cumplioResolucion` BOOLEAN NULL,
    `creadoAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Ticket_codigo_key`(`codigo`),
    INDEX `Ticket_estado_idx`(`estado`),
    INDEX `Ticket_categoriaId_idx`(`categoriaId`),
    INDEX `Ticket_usuarioAsignadoId_idx`(`usuarioAsignadoId`),
    INDEX `Ticket_fechaLimiteResolucion_idx`(`fechaLimiteResolucion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistorialTicket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `cambiadoPorId` INTEGER NOT NULL,
    `deEstado` ENUM('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO') NULL,
    `aEstado` ENUM('PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO') NOT NULL,
    `nota` VARCHAR(191) NULL,
    `creadoAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `HistorialTicket_ticketId_idx`(`ticketId`),
    INDEX `HistorialTicket_cambiadoPorId_idx`(`cambiadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImagenTicket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `historialId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `creadoAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `ImagenTicket_historialId_idx`(`historialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Regla` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `eliminadaAt` DATETIME(3) NULL,
    `pesoPrioridad` DOUBLE NULL,
    `pesoSlaRestante` DOUBLE NULL,
    `pesoCargaTrabajo` DOUBLE NULL,
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Regla_nombre_key`(`nombre`),
    INDEX `Regla_activa_idx`(`activa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asignacion` (
    `ticketId` INTEGER NOT NULL,
    `usuarioTecnicoId` INTEGER NOT NULL,
    `metodo` ENUM('AUTOMATICA', 'MANUAL') NOT NULL,
    `motivo` VARCHAR(191) NULL,
    `puntajePrioridad` INTEGER NULL,
    `slaRestanteMin` INTEGER NULL,
    `reglaId` INTEGER NULL,
    `creadoAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Asignacion_reglaId_idx`(`reglaId`),
    PRIMARY KEY (`ticketId`, `usuarioTecnicoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('TICKET_ASIGNADO', 'ESTADO_CAMBIADO', 'NUEVA_OBSERVACION', 'INICIO_SESION') NOT NULL,
    `emisorId` INTEGER NULL,
    `receptorId` INTEGER NOT NULL,
    `ticketId` INTEGER NULL,
    `estado` ENUM('PENDIENTE', 'ATENDIDA') NOT NULL DEFAULT 'PENDIENTE',
    `mensaje` VARCHAR(191) NULL,
    `creadoAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `leidoAt` DATETIME(0) NULL,
    `atendidoAt` DATETIME(0) NULL,
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Notificacion_receptorId_idx`(`receptorId`),
    INDEX `Notificacion_ticketId_idx`(`ticketId`),
    INDEX `Notificacion_tipo_idx`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ValoracionServicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `puntaje` INTEGER NOT NULL,
    `comentario` VARCHAR(191) NULL,
    `creadoPorId` INTEGER NOT NULL,
    `creadoAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `ValoracionServicio_ticketId_key`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EspecialidadToUsuario` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_EspecialidadToUsuario_AB_unique`(`A`, `B`),
    INDEX `_EspecialidadToUsuario_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CategoriaToEtiqueta` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CategoriaToEtiqueta_AB_unique`(`A`, `B`),
    INDEX `_CategoriaToEtiqueta_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CategoriaToEspecialidad` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CategoriaToEspecialidad_AB_unique`(`A`, `B`),
    INDEX `_CategoriaToEspecialidad_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Categoria` ADD CONSTRAINT `Categoria_slaId_fkey` FOREIGN KEY (`slaId`) REFERENCES `SLA`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_solicitanteId_fkey` FOREIGN KEY (`solicitanteId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_cerradoPorId_fkey` FOREIGN KEY (`cerradoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_usuarioAsignadoId_fkey` FOREIGN KEY (`usuarioAsignadoId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialTicket` ADD CONSTRAINT `HistorialTicket_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialTicket` ADD CONSTRAINT `HistorialTicket_cambiadoPorId_fkey` FOREIGN KEY (`cambiadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImagenTicket` ADD CONSTRAINT `ImagenTicket_historialId_fkey` FOREIGN KEY (`historialId`) REFERENCES `HistorialTicket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_usuarioTecnicoId_fkey` FOREIGN KEY (`usuarioTecnicoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_reglaId_fkey` FOREIGN KEY (`reglaId`) REFERENCES `Regla`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_emisorId_fkey` FOREIGN KEY (`emisorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_receptorId_fkey` FOREIGN KEY (`receptorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValoracionServicio` ADD CONSTRAINT `ValoracionServicio_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValoracionServicio` ADD CONSTRAINT `ValoracionServicio_creadoPorId_fkey` FOREIGN KEY (`creadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EspecialidadToUsuario` ADD CONSTRAINT `_EspecialidadToUsuario_A_fkey` FOREIGN KEY (`A`) REFERENCES `Especialidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EspecialidadToUsuario` ADD CONSTRAINT `_EspecialidadToUsuario_B_fkey` FOREIGN KEY (`B`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaToEtiqueta` ADD CONSTRAINT `_CategoriaToEtiqueta_A_fkey` FOREIGN KEY (`A`) REFERENCES `Categoria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaToEtiqueta` ADD CONSTRAINT `_CategoriaToEtiqueta_B_fkey` FOREIGN KEY (`B`) REFERENCES `Etiqueta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaToEspecialidad` ADD CONSTRAINT `_CategoriaToEspecialidad_A_fkey` FOREIGN KEY (`A`) REFERENCES `Categoria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaToEspecialidad` ADD CONSTRAINT `_CategoriaToEspecialidad_B_fkey` FOREIGN KEY (`B`) REFERENCES `Especialidad`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
