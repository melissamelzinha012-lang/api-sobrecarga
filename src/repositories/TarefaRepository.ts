
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class TarefaRepository {
  async listarPorUsuario(usuarioId: number) {
    return prisma.tarefa.findMany({
      where: { usuarioId },
      orderBy: [
        { prazo: "asc" },
        { criadoEm: "desc" },
      ],
    });
  }

  async buscarPorId(id: number, usuarioId: number) {
    return prisma.tarefa.findFirst({
      where: { id, usuarioId },
    });
  }

  async criar(dados: {
    titulo: string;
    descricao?: string;
    prazo?: Date | null;
    prioridade: string;
    usuarioId: number;
  }) {
    return prisma.tarefa.create({
      data: dados,
    });
  }

  async atualizar(
    id: number,
    usuarioId: number,
    dados: {
      titulo?: string;
      descricao?: string;
      prazo?: Date | null;
      prioridade?: string;
      status?: string;
    }
  ) {
    return prisma.tarefa.updateMany({
      where: { id, usuarioId },
      data: dados,
    });
  }

  async concluir(id: number, usuarioId: number) {
    return prisma.tarefa.updateMany({
      where: { id, usuarioId },
      data: { status: "CONCLUIDA" },
    });
  }

  async excluir(id: number, usuarioId: number) {
    return prisma.tarefa.deleteMany({
      where: { id, usuarioId },
    });
  }
}
