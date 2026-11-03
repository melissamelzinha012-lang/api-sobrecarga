-- AlterTable
ALTER TABLE `compromissos` ADD COLUMN `descricao` TEXT NULL,
    ADD COLUMN `disciplina` VARCHAR(120) NULL,
    ADD COLUMN `tipo` ENUM('COMPROMISSO', 'PROVA', 'TRABALHO') NOT NULL DEFAULT 'COMPROMISSO';

-- CreateTable
CREATE TABLE `estudos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `materia` VARCHAR(120) NOT NULL,
    `inicio` DATETIME(3) NOT NULL,
    `fim` DATETIME(3) NOT NULL,
    `concluido` BOOLEAN NOT NULL DEFAULT false,
    `usuario_id` INTEGER NOT NULL,
    `compromisso_id` INTEGER NULL,

    INDEX `estudos_usuario_id_inicio_idx`(`usuario_id`, `inicio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tarefas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `prazo` DATETIME(3) NULL,
    `inicio` DATETIME(3) NULL,
    `fim` DATETIME(3) NULL,
    `prioridade` VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuario_id` INTEGER NOT NULL,

    INDEX `tarefas_usuario_id_prazo_idx`(`usuario_id`, `prazo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `estudos` ADD CONSTRAINT `estudos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estudos` ADD CONSTRAINT `estudos_compromisso_id_fkey` FOREIGN KEY (`compromisso_id`) REFERENCES `compromissos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tarefas` ADD CONSTRAINT `tarefas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
