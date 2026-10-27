import { PrismaClient, TipoCompromisso } from "@prisma/client";

const prisma = new PrismaClient();

export interface ProvaTrabalhoDados {
  titulo: string;
  disciplina: string;
  descricao?: string;
  data: Date;
  horario?: string;
  tipo: TipoCompromisso;
}

class ProvaTrabalhoRepository {
  async criar(dados: ProvaTrabalhoDados) {
    return prisma.compromisso.create({
      data: dados,
    });
  }

  async listar() {
    return prisma.compromisso.findMany({
      orderBy: { data: "asc" },
    });
  }

  async buscarPorId(id: number) {
    return prisma.compromisso.findUnique({
      where: { id },
    });
  }

  async atualizar(id: number, dados: Partial<ProvaTrabalhoDados>) {
    return prisma.compromisso.update({
      where: { id },
      data: dados,
    });
  }

  async excluir(id: number) {
    return prisma.compromisso.delete({
      where: { id },
    });
  }
}

export default new ProvaTrabalhoRepository();