

import { Request, Response } from "express";

export class DashboardController {
  async index(req: Request, res: Response) {
    try {
      const hoje = new Date().toISOString().split("T")[0];

      const compromissos = [
        {
          titulo: "Aula de Matemática",
          data: hoje,
          horarioInicio: "08:00",
          horarioFim: "09:30"
        },
        {
          titulo: "Treino de vôlei",
          data: hoje,
          horarioInicio: "19:00",
          horarioFim: "20:00"
        }
      ];

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