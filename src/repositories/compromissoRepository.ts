
import { prisma } from "../config/database/prisma";

export class CompromissoRepository {
  async listarTodos() {
    return await prisma.compromisso.findMany({
      orderBy: [
        { data: "asc" },
        { horarioInicio: "asc" },
      ],
    });
  }

  async buscarPorId(id: number) {
    return await prisma.compromisso.findUnique({
      where: { id },
    });
  }

  async criar(
    titulo: string,
    data: string,
    horarioInicio: string,
    horarioFim: string,
    usuarioId: number
  ) {
    return await prisma.compromisso.create({
      data: {
        titulo,
        data: new Date(`${data}T12:00:00`),
        horarioInicio: new Date(`1970-01-01T${horarioInicio}:00`),
        horarioFim: new Date(`1970-01-01T${horarioFim}:00`),
        usuarioId,
      },
    });
  }

  async atualizar(
    id: number,
    titulo: string,
    data: string,
    horarioInicio: string,
    horarioFim: string
  ) {
    return await prisma.compromisso.update({
      where: { id },
      data: {
        titulo,
        data: new Date(`${data}T12:00:00`),
        horarioInicio: new Date(`1970-01-01T${horarioInicio}:00`),
        horarioFim: new Date(`1970-01-01T${horarioFim}:00`),
      },
    });
  }

  async excluir(id: number) {
    return await prisma.compromisso.delete({
      where: { id },
    });
  }
}