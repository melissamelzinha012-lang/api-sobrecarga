import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UsuarioRepository } from '../repositories/usuarioRepository.ts';

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

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({
        mensagem: 'E-mail ou senha inválidos'
      });
    }

    req.session.usuarioId = usuario.id;

    return res.json({
      mensagem: 'Login realizado com sucesso'
    });
  }
}