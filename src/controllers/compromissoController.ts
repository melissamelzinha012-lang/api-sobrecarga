
import { Request, Response } from "express";
import { CompromissoRepository } from "../repositories/compromissoRepository";

const compromissoRepository = new CompromissoRepository();

export class CompromissoController {

  async novo(req: Request, res: Response) {
    return res.render("compromissos/novo");
  }

  async listar(req: Request, res: Response) {
    try {
      const compromissos = await compromissoRepository.listarTodos();

      return res.render("compromissos/index", {
        compromissos
      });
    } catch (error) {
      console.error("Erro ao listar compromissos:", error);
      return res.status(500).send("Erro ao listar compromissos");
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).send("ID inválido");
      }

      const compromisso = await compromissoRepository.buscarPorId(id);

      if (!compromisso) {
        return res.status(404).send("Compromisso não encontrado");
      }

      return res.json(compromisso);
    } catch (error) {
      console.error("Erro ao buscar compromisso:", error);
      return res.status(500).send("Erro ao buscar compromisso");
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const {
        titulo,
        data,
        horarioInicio,
        horarioFim,
        usuarioId
      } = req.body;

      if (!titulo || !data || !horarioInicio || !horarioFim || !usuarioId) {
        return res.status(400).send("Preencha todos os campos");
      }

      await compromissoRepository.criar(
        titulo,
        data,
        horarioInicio,
        horarioFim,
        Number(usuarioId)
      );

      return res.redirect("/compromissos");

    } catch (error) {
      console.error("Erro ao criar compromisso:", error);
      return res.status(500).send("Erro ao criar compromisso");
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const {
        titulo,
        data,
        horarioInicio,
        horarioFim
      } = req.body;

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).send("ID inválido");
      }

      if (!titulo || !data || !horarioInicio || !horarioFim) {
        return res.status(400).send("Preencha todos os campos");
      }

      const compromisso = await compromissoRepository.atualizar(
        id,
        titulo,
        data,
        horarioInicio,
        horarioFim
      );

      return res.json(compromisso);

    } catch (error) {
      console.error("Erro ao atualizar compromisso:", error);
      return res.status(500).send("Erro ao atualizar compromisso");
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).send("ID inválido");
      }

      await compromissoRepository.excluir(id);

      return res.json({
        mensagem: "Compromisso excluído com sucesso"
      });

    } catch (error) {
      console.error("Erro ao excluir compromisso:", error);
      return res.status(500).send("Erro ao excluir compromisso");
    }
  }
}