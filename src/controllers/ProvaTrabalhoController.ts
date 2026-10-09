import { Request, Response } from "express";
import repository from "../repositories/ProvaTrabalhoRepository";

class ProvaTrabalhoController {
  async listar(req: Request, res: Response) {
    try {
      const dados = await repository.listar();
      return res.json(dados);
    } catch {
      return res.status(500).json({
        mensagem: "Erro ao listar compromissos.",
      });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const dados = await repository.buscarPorId(id);

      if (!dados) {
        return res.status(404).json({
          mensagem: "Compromisso não encontrado.",
        });
      }

      return res.json(dados);
    } catch {
      return res.status(500).json({
        mensagem: "Erro ao buscar compromisso.",
      });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { titulo, disciplina, descricao, data, horario, tipo } =
        req.body;

      if (!titulo || !disciplina || !data || !tipo) {
        return res.status(400).json({
          mensagem: "Preencha título, disciplina, data e tipo.",
        });
      }

      if (!["PROVA", "TRABALHO", "ESTUDO"].includes(tipo)) {
        return res.status(400).json({
          mensagem: "Tipo de compromisso inválido.",
        });
      }

      const novo = await repository.criar({
        titulo,
        disciplina,
        descricao,
        data: new Date(`${data}T12:00:00`),
        horario,
        tipo,
      });

      return res.status(201).json(novo);
    } catch {
      return res.status(500).json({
        mensagem: "Erro ao cadastrar compromisso.",
      });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existente = await repository.buscarPorId(id);

      if (!existente) {
        return res.status(404).json({
          mensagem: "Compromisso não encontrado.",
        });
      }

      const dados = { ...req.body };

      if (dados.data) {
        dados.data = new Date(`${dados.data}T12:00:00`);
      }

      const atualizado = await repository.atualizar(id, dados);
      return res.json(atualizado);
    } catch {
      return res.status(500).json({
        mensagem: "Erro ao atualizar compromisso.",
      });
    }
  }

  async excluir(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existente = await repository.buscarPorId(id);

      if (!existente) {
        return res.status(404).json({
          mensagem: "Compromisso não encontrado.",
        });
      }

      await repository.excluir(id);

      return res.json({
        mensagem: "Compromisso excluído com sucesso.",
      });
    } catch {
      return res.status(500).json({
        mensagem: "Erro ao excluir compromisso.",
      });
    }
  }
}

export default new ProvaTrabalhoController();