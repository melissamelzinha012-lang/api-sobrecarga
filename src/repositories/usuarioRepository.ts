import { pool } from '../config/database/database';

export class UsuarioRepository {

  async buscarPorEmail(email: string) {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    const usuarios = rows as any[];

    return usuarios[0] || null;
  }

  async criar(
    nome: string,
    email: string,
    senhaHash: string,
    perfil: string = 'usuario'
  ) {
    const [result] = await pool.query(
      `
      INSERT INTO usuarios
      (nome, email, senha_hash, perfil)
      VALUES (?, ?, ?, ?)
      `,
      [nome, email, senhaHash, perfil]
    );

    return result;
  }
}