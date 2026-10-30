import { Request, Response } from 'express';

export class DashboardController {
  index(req: Request, res: Response) {
    return res.render('index', {
      compromissos: [],
      provas: [],
      tarefas: [],
      estudos: [],
      conflitos: []
    });
  }
}