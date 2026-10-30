import { Request, Response } from "express";
import { EstudoService } from "../services/EstudoService";

const service = new EstudoService();

function obterUsuarioId(req: Request): number {
  const usuarioId = Number(req.body.usuarioId ?? req.query.usuarioId);

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new Error("Informe um usuarioId válido.");
  }

  return usuarioId;
}

function responderErro(res: Response, erro: unknown) {
  const mensagem =
    erro instanceof Error ? erro.message : "Erro interno do servidor.";

  const status = mensagem.includes("não encontrada") ? 404 : 400;

  return res.status(status).json({ erro: mensagem });
}

export class EstudoController {
  async listar(req: Request, res: Response) {
    try {
      const dados = await service.listar(obterUsuarioId(req));
      return res.json(dados);
    } catch (erro) {
      return responderErro(res, erro);
    }
  }

  async horariosLivres(req: Request, res: Response) {
    try {
      const usuarioId = obterUsuarioId(req);
      const inicio = new Date(String(req.query.inicio ?? ""));
      const fim = new Date(String(req.query.fim ?? ""));

      const horarios = await service.buscarHorariosLivres(
        usuarioId,
        inicio,
        fim
      );

      return res.json(horarios);
    } catch (erro) {
      return responderErro(res, erro);
    }
  }

  async gerar(req: Request, res: Response) {
    try {
      const usuarioId = obterUsuarioId(req);
      const { materia, prazo, duracaoMinutos } = req.body;

      const sessoes = await service.gerarSessoes(
        usuarioId,
        String(materia ?? ""),
        new Date(String(prazo ?? "")),
        Number(duracaoMinutos)
      );

      return res.status(201).json(sessoes);
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

      const resultado = await service.concluir(id, obterUsuarioId(req));

      return res.json({
        mensagem: "Estudo concluído com sucesso.",
        resultado,
      });
    } catch (erro) {
      return responderErro(res, erro);
    }
  }

  async reorganizar(req: Request, res: Response) {
    try {
      const resultado = await service.reorganizar(obterUsuarioId(req));
      return res.json(resultado);
    } catch (erro) {
      return responderErro(res, erro);
    }
  }
}