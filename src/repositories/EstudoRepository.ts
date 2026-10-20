import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class EstudoRepository {
  // Listar estudos de um usuário
  async listarPorUsuario(usuarioId: number) {
    return prisma.estudo.findMany({
      where: { usuarioId },
      orderBy: { inicio: "asc" },
    });
  }

  // Buscar um estudo específico
  async buscarPorId(id: number, usuarioId: number) {
    return prisma.estudo.findFirst({
      where: { id, usuarioId },
    });
  }

  // Criar uma sessão de estudo
  async criar(dados: {
    usuarioId: number;
    materia: string;
    inicio: Date;
    fim: Date;
    compromissoId?: number | null;
  }) {
    return prisma.estudo.create({
      data: {
        ...dados,
        concluido: false,
      },
    });
  }

  // Marcar estudo como concluído
  async marcarComoConcluido(id: number, usuarioId: number) {
    return prisma.estudo.updateMany({
      where: { id, usuarioId },
      data: { concluido: true },
    });
  }

  // Atualizar horário de um estudo pendente
  async atualizarHorario(
    id: number,
    usuarioId: number,
    inicio: Date,
    fim: Date
  ) {
    return prisma.estudo.updateMany({
      where: {
        id,
        usuarioId,
        concluido: false,
      },
      data: { inicio, fim },
    });
  }

  // Excluir estudos pendentes
  async excluirPendentes(usuarioId: number) {
    return prisma.estudo.deleteMany({
      where: {
        usuarioId,
        concluido: false,
      },
    });
  }

  // Listar compromissos do usuário
  async listarCompromissos(usuarioId: number) {
    return prisma.compromisso.findMany({
      where: { usuarioId },
      orderBy: { inicio: "asc" },
    });
  }
}
