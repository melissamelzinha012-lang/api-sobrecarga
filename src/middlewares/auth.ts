import { Request, Response, NextFunction } from 'express';
import { AdminRepository, PERFIL_ADMIN } from '../repositories/adminRepository';

const adminRepository = new AdminRepository();

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

// Para a área administrativa: confere o perfil no banco a cada acesso,
// assim remover o admin de alguém vale na hora (não depende da sessão antiga).
export async function exigirAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const usuarioId = Number(req.session.usuario?.id);

  if (!req.session.usuario || !Number.isInteger(usuarioId)) {
    res.redirect('/login');
    return;
  }

  try {
    const perfil = await adminRepository.perfilDoUsuario(usuarioId);

    if (perfil !== PERFIL_ADMIN) {
      if (req.session.usuario) req.session.usuario.perfil = (perfil ?? 'usuario') as any;
      res.status(403).render('admin/acesso-negado');
      return;
    }

    next();
  } catch (erro) {
    next(erro);
  }
}
