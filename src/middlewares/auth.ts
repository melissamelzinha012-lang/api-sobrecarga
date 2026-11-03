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


// Para páginas: quem não está logado volta para a tela de login.
export function exigirLoginPagina(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.session.usuario) {
    res.redirect('/login');
    return;
  }

  next();
}
