import { PrismaClient, TipoCompromisso } from "@prisma/client";

const prisma = new PrismaClient();

export interface ProvaTrabalhoDados {
  titulo: string;
  disciplina: string;
  descricao?: string | null;
  data: Date;
  horarioInicio: Date;
  horarioFim: Date;
  tipo: TipoCompromisso;
}

class ProvaTrabalhoRepository {
  async criar(usuarioId: number, dados: ProvaTrabalhoDados) {
    return prisma.compromisso.create({
      data: { ...dados, usuarioId },
    });
  }

  async listar(usuarioId: number) {
    return prisma.compromisso.findMany({
      where: {
        usuarioId,
        tipo: { in: [TipoCompromisso.PROVA, TipoCompromisso.TRABALHO] },
      },
      orderBy: [{ data: "asc" }, { horarioInicio: "asc" }],
    });
  }

  async buscarPorId(id: number, usuarioId: number) {
    return prisma.compromisso.findFirst({
      where: { id, usuarioId },
    });
  }

  async atualizar(
    id: number,
    usuarioId: number,
    dados: Partial<ProvaTrabalhoDados>
  ) {
    return prisma.compromisso.updateMany({
      where: { id, usuarioId },
      data: dados,
    });
  }

  async excluir(id: number, usuarioId: number) {
    return prisma.compromisso.deleteMany({
      where: { id, usuarioId },
    });
  }
}

export default new ProvaTrabalhoRepository();
