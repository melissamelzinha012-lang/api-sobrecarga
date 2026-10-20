


import { prisma } from "../config/database/prisma";

export class CompromissoRepository {
  async listarTodos(usuarioId: number) {
    return await prisma.compromisso.findMany({
      where: { usuarioId },
      orderBy: [
        { data: "asc" },
        { horarioInicio: "asc" },
      ],
    });
  }

  async buscarPorId(id: number, usuarioId: number) {
    return await prisma.compromisso.findFirst({
      where: {
        id,
        usuarioId,
      },
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

  // Commit 36: editar compromisso existente
  async atualizar(
    id: number,
    titulo: string,
    data: string,
    horarioInicio: string,
    horarioFim: string,
    usuarioId: number
  ) {
    return await prisma.compromisso.updateMany({
      where: {
        id,
        usuarioId,
      },
      data: {
        titulo,
        data: new Date(`${data}T12:00:00`),
        horarioInicio: new Date(
          `1970-01-01T${horarioInicio}:00`
        ),
        horarioFim: new Date(
          `1970-01-01T${horarioFim}:00`
        ),
      },
    });
  }

  async excluir(id: number, usuarioId: number) {
    return await prisma.compromisso.deleteMany({
      where: {
        id,
        usuarioId,
      },
    });
  }
}
