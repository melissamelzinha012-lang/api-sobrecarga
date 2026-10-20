
import { prisma } from "../config/database/prisma";

export class CompromissoRepository {
  async listarTodos(usuarioId: number) {
    return await prisma.compromisso.findMany({
      where: {
        usuarioId,
      },
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

  async existeSobreposicao(
    data: string,
    horarioInicio: string,
    horarioFim: string,
    usuarioId: number,
    ignorarId?: number
  ) {
    const dataCompromisso = new Date(`${data}T12:00:00`);

    const inicio = new Date(
      `1970-01-01T${horarioInicio}:00`
    );

    const fim = new Date(
      `1970-01-01T${horarioFim}:00`
    );

    const compromisso = await prisma.compromisso.findFirst({
      where: {
        usuarioId,
        data: dataCompromisso,
        horarioInicio: {
          lt: fim,
        },
        horarioFim: {
          gt: inicio,
        },
        ...(ignorarId !== undefined
          ? {
              id: {
                not: ignorarId,
              },
            }
          : {}),
      },
    });

    return compromisso !== null;
  }

  async criar(
    titulo: string,
    data: string,
    horarioInicio: string,
    horarioFim: string,
    usuarioId: number
  ) {
    const sobreposicao = await this.existeSobreposicao(
      data,
      horarioInicio,
      horarioFim,
      usuarioId
    );

    if (sobreposicao) {
      throw new Error(
        "Já existe um compromisso nesse horário."
      );
    }

    return await prisma.compromisso.create({
      data: {
        titulo,
        data: new Date(`${data}T12:00:00`),
        horarioInicio: new Date(
          `1970-01-01T${horarioInicio}:00`
        ),
        horarioFim: new Date(
          `1970-01-01T${horarioFim}:00`
        ),
        usuarioId,
      },
    });
  }

  async atualizar(
    id: number,
    titulo: string,
    data: string,
    horarioInicio: string,
    horarioFim: string,
    usuarioId: number
  ) {
    // Confirma que o compromisso pertence ao usuário.
    const compromissoExistente = await this.buscarPorId(
      id,
      usuarioId
    );

    if (!compromissoExistente) {
      return { count: 0 };
    }

    // Verifica sobreposição somente entre compromissos
    // do mesmo usuário e ignora o compromisso atual.
    const sobreposicao = await this.existeSobreposicao(
      data,
      horarioInicio,
      horarioFim,
      usuarioId,
      id
    );

    if (sobreposicao) {
      throw new Error(
        "Já existe outro compromisso nesse horário."
      );
    }

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
