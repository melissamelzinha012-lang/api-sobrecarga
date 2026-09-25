
import { Request, Response } from "express";

export class DashboardController {
  async index(req: Request, res: Response) {
    try {
      const compromissos = [];
      const provas = [];
      const tarefas = [];
      const estudos = [];
      const conflitos = [];

      return res.render("dashboard/index", {
        compromissos,
        provas,
        tarefas,
        estudos,
        conflitos
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);

      return res.status(500).send("Erro ao carregar dashboard");
    }
  }
}
