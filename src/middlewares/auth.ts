import { Request, Response, NextFunction } from 'express';

export function verificarLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session.usuarioId) {
    return res.status(401).json({
      mensagem: 'Usuário não autenticado'
    });
  }

  next();
}