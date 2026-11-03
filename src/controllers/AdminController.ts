import { Request, Response } from "express";
import {
  AdminRepository,
  PERFIL_ADMIN,
  PERFIL_USUARIO,
} from "../repositories/adminRepository";

const repository = new AdminRepository();

const DIA_MS = 24 * 60 * 60 * 1000;
const DIAS_GRAFICO = 14;

const MENSAGENS: Record<string, { tipo: "ok" | "erro"; texto: string }> = {
  promovido: { tipo: "ok", texto: "O usuário agora é administrador." },
  rebaixado: { tipo: "ok", texto: "O usuário voltou a ser um usuário comum." },
  excluido: { tipo: "ok", texto: "Conta excluída, junto com todos os dados dela." },
  "proprio-perfil": { tipo: "erro", texto: "Você não pode remover a sua própria permissão de administrador." },
  "propria-conta": { tipo: "erro", texto: "Você não pode excluir a sua própria conta por aqui." },
  "ultimo-admin": { tipo: "erro", texto: "É preciso manter pelo menos um administrador no sistema." },
  "nao-encontrado": { tipo: "erro", texto: "Usuário não encontrado." },
  erro: { tipo: "erro", texto: "Não foi possível concluir a ação. Tente novamente." },
};

function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function porcentagem(parte: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((parte / total) * 100)}%`;
}

export class AdminController {
  async index(_req: Request, res: Response) {
    try {
      const hoje = inicioDoDia(new Date());
      const seteDiasAtras = new Date(hoje.getTime() - 6 * DIA_MS);
      const inicioGrafico = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - (DIAS_GRAFICO - 1)
      );

      const [totais, datas, ultimos] = await Promise.all([
        repository.totais(seteDiasAtras),
        repository.datasDeCadastro(inicioGrafico),
        repository.ultimosUsuarios(6),
      ]);

      const contagem = new Array(DIAS_GRAFICO).fill(0);
      for (const data of datas) {
        const indice = Math.round(
          (inicioDoDia(data).getTime() - inicioGrafico.getTime()) / DIA_MS
        );
        if (indice >= 0 && indice < DIAS_GRAFICO) contagem[indice]++;
      }

      const barras = contagem.map((quantidade, i) => {
        const dia = new Date(
          inicioGrafico.getFullYear(),
          inicioGrafico.getMonth(),
          inicioGrafico.getDate() + i
        );
        const ehHoje = i === DIAS_GRAFICO - 1;
        return {
          rotulo: ehHoje ? "Hoje" : dia.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          detalhe: dia.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }),
          quantidade,
          destaque: ehHoje,
        };
      });

      const cartoes = [
        { rotulo: "Usuários cadastrados", valor: String(totais.usuarios), detalhe: `${totais.administradores} ${totais.administradores === 1 ? "administrador" : "administradores"}` },
        { rotulo: "Novos nos últimos 7 dias", valor: String(totais.novosUsuarios), detalhe: totais.novosUsuarios === 1 ? "cadastro" : "cadastros" },
        { rotulo: "Compromissos", valor: String(totais.compromissos), detalhe: "em todas as contas" },
        { rotulo: "Provas e trabalhos", valor: String(totais.avaliacoes), detalhe: "em todas as contas" },
        { rotulo: "Tarefas", valor: String(totais.tarefas), detalhe: `${porcentagem(totais.tarefasConcluidas, totais.tarefas)} concluídas` },
        { rotulo: "Sessões de estudo", valor: String(totais.estudos), detalhe: `${porcentagem(totais.estudosConcluidos, totais.estudos)} concluídas` },
      ];

      return res.render("admin/index", {
        cartoes,
        grafico: {
          titulo: `Novos cadastros nos últimos ${DIAS_GRAFICO} dias`,
          barras,
          unidade: ["cadastro", "cadastros"],
        },
        ultimos,
      });
    } catch (erro) {
      console.error("Erro ao carregar painel administrativo:", erro);
      return res.status(500).send("Erro ao carregar o painel administrativo.");
    }
  }

  async usuarios(req: Request, res: Response) {
    try {
      const busca = typeof req.query.busca === "string" ? req.query.busca : "";
      const usuarios = await repository.listarUsuarios(busca);
      const codigo = typeof req.query.msg === "string" ? req.query.msg : "";

      return res.render("admin/usuarios", {
        usuarios,
        busca,
        mensagem: MENSAGENS[codigo] ?? null,
        meuId: Number(req.session.usuario?.id),
        PERFIL_ADMIN,
      });
    } catch (erro) {
      console.error("Erro ao listar usuários:", erro);
      return res.status(500).send("Erro ao listar usuários.");
    }
  }

  async alterarPerfil(req: Request, res: Response) {
    const voltar = (msg: string) => res.redirect(`/admin/usuarios?msg=${msg}`);

    try {
      const id = Number(req.params.id);
      const meuId = Number(req.session.usuario?.id);
      const novoPerfil = req.body.perfil === PERFIL_ADMIN ? PERFIL_ADMIN : PERFIL_USUARIO;

      if (!Number.isInteger(id) || id <= 0) return voltar("nao-encontrado");
      if (id === meuId && novoPerfil !== PERFIL_ADMIN) return voltar("proprio-perfil");

      const perfilAtual = await repository.perfilDoUsuario(id);
      if (perfilAtual === null) return voltar("nao-encontrado");

      if (perfilAtual === PERFIL_ADMIN && novoPerfil !== PERFIL_ADMIN) {
        const { administradores } = await repository.totais(new Date());
        if (administradores <= 1) return voltar("ultimo-admin");
      }

      await repository.alterarPerfil(id, novoPerfil);
      return voltar(novoPerfil === PERFIL_ADMIN ? "promovido" : "rebaixado");
    } catch (erro) {
      console.error("Erro ao alterar perfil:", erro);
      return voltar("erro");
    }
  }

  async excluir(req: Request, res: Response) {
    const voltar = (msg: string) => res.redirect(`/admin/usuarios?msg=${msg}`);

    try {
      const id = Number(req.params.id);
      const meuId = Number(req.session.usuario?.id);

      if (!Number.isInteger(id) || id <= 0) return voltar("nao-encontrado");
      if (id === meuId) return voltar("propria-conta");

      const perfilAtual = await repository.perfilDoUsuario(id);
      if (perfilAtual === null) return voltar("nao-encontrado");

      if (perfilAtual === PERFIL_ADMIN) {
        const { administradores } = await repository.totais(new Date());
        if (administradores <= 1) return voltar("ultimo-admin");
      }

      await repository.excluirUsuario(id);
      return voltar("excluido");
    } catch (erro) {
      console.error("Erro ao excluir usuário:", erro);
      return voltar("erro");
    }
  }
}
