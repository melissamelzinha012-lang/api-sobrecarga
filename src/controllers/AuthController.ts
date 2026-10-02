import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UsuarioRepository } from '../repositories/usuarioRepository';

const usuarioRepository = new UsuarioRepository();

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    const usuario = await usuarioRepository.buscarPorEmail(email);

    if (!usuario) {
      return res.status(401).json({
        mensagem: 'E-mail ou senha inválidos'
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaValida) {
      return res.status(401).json({
        mensagem: 'E-mail ou senha inválidos'
      });
    }

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil as any
    };

    return res.json({
      mensagem: 'Login realizado com sucesso'
    });
  }
}
