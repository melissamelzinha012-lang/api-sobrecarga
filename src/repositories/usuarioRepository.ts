import { pool } from '../config/database/database.ts';

export class UsuarioRepository {
  async buscarPorEmail(email: string) {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    return (rows as any[])[0];
  }

  async criar(nome: string, email: string, senhaHash: string, perfil: string) {
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, perfil]
    );

    return result;
  }
}