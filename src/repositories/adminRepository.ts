import { TipoCompromisso } from "@prisma/client";
import { prisma } from "../config/database/prisma";

export const PERFIL_ADMIN = "ADMIN";
export const PERFIL_USUARIO = "usuario";

export class AdminRepository {
  async perfilDoUsuario(id: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { perfil: true },
    });
    return usuario?.perfil ?? null;
  }

  async totais(desde: Date) {
    const [
      usuarios,
      administradores,
      novosUsuarios,
      compromissos,
      avaliacoes,
      tarefas,
      tarefasConcluidas,
      estudos,
      estudosConcluidos,
    ] = await prisma.$transaction([
      prisma.usuario.count(),
      prisma.usuario.count({ where: { perfil: PERFIL_ADMIN } }),
      prisma.usuario.count({ where: { criadoEm: { gte: desde } } }),
      prisma.compromisso.count({ where: { tipo: TipoCompromisso.COMPROMISSO } }),
      prisma.compromisso.count({
        where: { tipo: { in: [TipoCompromisso.PROVA, TipoCompromisso.TRABALHO] } },
      }),
      prisma.tarefa.count(),
      prisma.tarefa.count({ where: { status: "CONCLUIDA" } }),
      prisma.estudo.count(),
      prisma.estudo.count({ where: { concluido: true } }),
    ]);

    return {
      usuarios,
      administradores,
      novosUsuarios,
      compromissos,
      avaliacoes,
      tarefas,
      tarefasConcluidas,
      estudos,
      estudosConcluidos,
    };
  }

  async datasDeCadastro(desde: Date) {
    const usuarios = await prisma.usuario.findMany({
      where: { criadoEm: { gte: desde } },
      select: { criadoEm: true },
    });
    return usuarios.map((u) => u.criadoEm);
  }

  async ultimosUsuarios(quantidade: number) {
    return prisma.usuario.findMany({
      orderBy: { criadoEm: "desc" },
      take: quantidade,
      select: { id: true, nome: true, email: true, perfil: true, criadoEm: true },
    });
  }

  async listarUsuarios(busca?: string) {
    const termo = busca?.trim();

    return prisma.usuario.findMany({
      where: termo
        ? { OR: [{ nome: { contains: termo } }, { email: { contains: termo } }] }
        : undefined,
      orderBy: [{ perfil: "asc" }, { nome: "asc" }],
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        criadoEm: true,
        _count: { select: { compromissos: true, tarefas: true, estudos: true } },
      },
    });
  }

  async alterarPerfil(id: number, perfil: string) {
    return prisma.usuario.update({ where: { id }, data: { perfil } });
  }

  async excluirUsuario(id: number) {
    // Compromissos, estudos e tarefas são apagados em cascata (onDelete: Cascade).
    return prisma.usuario.delete({ where: { id } });
  }
}
