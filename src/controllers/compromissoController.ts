import { Request, Response } from "express";
import { CompromissoRepository } from "../repositories/compromissoRepository";

const compromissoRepository = new CompromissoRepository();

export class CompromissoController {

  async novo(req: Request, res: Response) {
    const usuarioId = Number(req.session.usuario?.id);

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      return res.redirect("/auth/login");
    }

    return res.render("compromissos/novo");
  }

  async listar(req: Request, res: Response) {
    try {
      const usuarioId = Number(req.session.usuario?.id);

      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return res.redirect("/auth/login");
      }

      const compromissos =
        await compromissoRepository.listarTodos(usuarioId);

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
      const usuarioId = Number(req.session.usuario?.id);
      const id = Number(req.params.id);

      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return res.redirect("/auth/login");
      }

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).send("ID inválido");
      }

      const compromisso =
        await compromissoRepository.buscarPorId(id, usuarioId);

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
      const usuarioId = Number(req.session.usuario?.id);

      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return res.redirect("/auth/login");
      }

      const {
        titulo,
        data,
        horarioInicio,
        horarioFim
      } = req.body;

      if (!titulo || !data || !horarioInicio || !horarioFim) {
        return res.status(400).send("Preencha todos os campos");
      }

      const formatoHorario = /^([01]\d|2[0-3]):[0-5]\d$/;

      if (
        !formatoHorario.test(horarioInicio) ||
        !formatoHorario.test(horarioFim)
      ) {
        return res.status(400).send("Formato de horário inválido");
      }

      if (horarioInicio >= horarioFim) {
        return res.status(400).send(
          "O horário de início deve ser anterior ao horário de fim"
        );
      }

      await compromissoRepository.criar(
        titulo,
        data,
        horarioInicio,
        horarioFim,
        usuarioId
      );

      return res.redirect("/compromissos");
    } catch (error) {
      console.error("Erro ao criar compromisso:", error);
      return res.status(500).send("Erro ao criar compromisso");
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const usuarioId = Number(req.session.usuario?.id);
      const id = Number(req.params.id);

      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return res.redirect("/auth/login");
      }

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).send("ID inválido");
      }

      const {
        titulo,
        data,
        horarioInicio,
        horarioFim
      } = req.body;

      if (!titulo || !data || !horarioInicio || !horarioFim) {
        return res.status(400).send("Preencha todos os campos");
      }

      const formatoHorario = /^([01]\d|2[0-3]):[0-5]\d$/;

      if (
        !formatoHorario.test(horarioInicio) ||
        !formatoHorario.test(horarioFim)
      ) {
        return res.status(400).send("Formato de horário inválido");
      }

      if (horarioInicio >= horarioFim) {
        return res.status(400).send(
          "O horário de início deve ser anterior ao horário de fim"
        );
      }

      const resultado =
        await compromissoRepository.atualizar(
          id,
          titulo,
          data,
          horarioInicio,
          horarioFim,
          usuarioId
        );

      if (resultado.count === 0) {
        return res.status(404).send("Compromisso não encontrado");
      }

      return res.json({
        mensagem: "Compromisso atualizado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao atualizar compromisso:", error);
      return res.status(500).send("Erro ao atualizar compromisso");
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const usuarioId = Number(req.session.usuario?.id);
      const id = Number(req.params.id);

      if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        return res.redirect("/auth/login");
      }

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).send("ID inválido");
      }

      const resultado =
        await compromissoRepository.excluir(id, usuarioId);

      if (resultado.count === 0) {
        return res.status(404).send("Compromisso não encontrado");
      }

      return res.json({
        mensagem: "Compromisso excluído com sucesso"
      });
    } catch (error) {
      console.error("Erro ao excluir compromisso:", error);
      return res.status(500).send("Erro ao excluir compromisso");
    }
  }
}