
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

      const provas = [
        {
          disciplina: "Química",
          data: "2026-10-05",
          horario: "08:00"
        },
        {
          disciplina: "Matemática",
          data: "2026-10-08",
          horario: "10:00"
        }
      ];

      const tarefas = [
        {
          titulo: "Estudar para a prova de Química",
          prazo: "2026-10-03",
          status: "Pendente"
        },
        {
          titulo: "Fazer atividade de Matemática",
          prazo: "2026-10-04",
          status: "Pendente"
        }
      ];

      const estudos = [
        {
          titulo: "Revisão de Química",
          data: "2026-10-01",
          horarioInicio: "14:00",
          horarioFim: "15:00"
        },
        {
          titulo: "Exercícios de Matemática",
          data: "2026-10-02",
          horarioInicio: "16:00",
          horarioFim: "17:00"
        }
      ];

      const conflitos = [
        {
          mensagem:
            "Conflito entre a aula de Matemática e o horário de estudo."
        },
        {
          mensagem:
            "Você possui dois compromissos no mesmo horário."
        }
      ];

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