import { Request, Response, NextFunction } from 'express';

export function verificarLogin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.session.usuario) {
    res.status(401).json({
      mensagem: 'Acesso não autorizado. Faça login para continuar.'
    });

    return;
  }

  next();
}
