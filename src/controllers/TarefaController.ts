
import { Request, Response } from "express";
import { TarefaRepository } from "../repositories/TarefaRepository";

const repository = new TarefaRepository();

function obterUsuarioId(req: Request): number {
  const usuarioId = req.session.usuario?.id;

  if (!usuarioId) {
    throw new Error("Usuário não autenticado.");
  }

  return usuarioId;
}

function responderErro(res: Response, erro: unknown) {
  const mensagem =
    erro instanceof Error ? erro.message : "Erro interno do servidor.";

  const status = mensagem.includes("não encontrada")
    ? 404
    : mensagem.includes("não autenticado")
      ? 401
      : 400;

  return res.status(status).json({ erro: mensagem });
}

export class TarefaController {
  async listar(req: Request, res: Response) {
    try {
      const tarefas = await repository.listarPorUsuario(obterUsuarioId(req));
      return res.json(tarefas);
    } catch (erro) {
      return responderErro(res, erro);
    }
  }

  async buscar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID inválido." });
      }

      const tarefa = await repository.buscarPorId(
        id,
        obterUsuarioId(req)
      );

      if (!tarefa) {
        return res.status(404).json({ erro: "Tarefa não encontrada." });
      }

      return res.json(tarefa);
    } catch (erro) {
      return responderErro(res, erro);
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const usuarioId = obterUsuarioId(req);
      const { titulo, descricao, prazo, prioridade } = req.body;

      if (!String(titulo ?? "").trim()) {
        return res.status(400).json({ erro: "Informe o título da tarefa." });
      }

      const prioridades = ["BAIXA", "MEDIA", "ALTA"];
      const prioridadeFinal = String(prioridade ?? "MEDIA").toUpperCase();

      if (!prioridades.includes(prioridadeFinal)) {
        return res.status(400).json({ erro: "Prioridade inválida." });
      }

      const prazoFinal = prazo ? new Date(`${prazo}T12:00:00`) : null;

      if (prazo && Number.isNaN(prazoFinal!.getTime())) {
        return res.status(400).json({ erro: "Informe um prazo válido." });
      }

      const tarefa = await repository.criar({
        titulo: String(titulo).trim(),
        descricao: descricao ? String(descricao).trim() : undefined,
        prazo: prazoFinal,
        prioridade: prioridadeFinal,
        usuarioId,
      });

      return res.status(201).json(tarefa);
    } catch (erro) {
      return responderErro(res, erro);
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const usuarioId = obterUsuarioId(req);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID inválido." });
      }

      const existente = await repository.buscarPorId(id, usuarioId);

      if (!existente) {
        return res.status(404).json({ erro: "Tarefa não encontrada." });
      }

      const { titulo, descricao, prazo, prioridade, status } = req.body;

      if (titulo !== undefined && !String(titulo).trim()) {
        return res.status(400).json({ erro: "O título não pode ficar vazio." });
      }

      const prioridades = ["BAIXA", "MEDIA", "ALTA"];
      const statusPermitidos = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"];

      if (prioridade !== undefined &&
          !prioridades.includes(String(prioridade).toUpperCase())) {
        return res.status(400).json({ erro: "Prioridade inválida." });
      }

      if (status !== undefined &&
          !statusPermitidos.includes(String(status).toUpperCase())) {
        return res.status(400).json({ erro: "Status inválido." });
      }

      let prazoFinal: Date | null | undefined;

      if (prazo !== undefined) {
        prazoFinal = prazo ? new Date(`${prazo}T12:00:00`) : null;

        if (prazoFinal && Number.isNaN(prazoFinal.getTime())) {
          return res.status(400).json({ erro: "Informe um prazo válido." });
        }
      }

      const resultado = await repository.atualizar(id, usuarioId, {
        ...(titulo !== undefined ? { titulo: String(titulo).trim() } : {}),
        ...(descricao !== undefined ? { descricao: String(descricao).trim() } : {}),
        ...(prazo !== undefined ? { prazo: prazoFinal } : {}),
        ...(prioridade !== undefined ? { prioridade: String(prioridade).toUpperCase() } : {}),
        ...(status !== undefined ? { status: String(status).toUpperCase() } : {}),
      });

      return res.json({
        mensagem: "Tarefa atualizada com sucesso.",
        resultado,
      });
    } catch (erro) {
      return responderErro(res, erro);
    }
  }

  async concluir(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID inválido." });
      }

      const resultado = await repository.concluir(
        id,
        obterUsuarioId(req)
      );

      if (resultado.count === 0) {
        return res.status(404).json({ erro: "Tarefa não encontrada." });
      }

      return res.json({ mensagem: "Tarefa concluída com sucesso." });
    } catch (erro) {
      return responderErro(res, erro);
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: "ID inválido." });
      }

      const resultado = await repository.excluir(
        id,
        obterUsuarioId(req)
      );

      if (resultado.count === 0) {
        return res.status(404).json({ erro: "Tarefa não encontrada." });
      }

      return res.json({ mensagem: "Tarefa excluída com sucesso." });
    } catch (erro) {
      return responderErro(res, erro);
    }
  }
}
