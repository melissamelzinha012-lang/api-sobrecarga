import { prisma } from '../config/database/prisma';

export class UsuarioRepository {
  async buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email }
    });
  }

  async criar(
    nome: string,
    email: string,
    senhaHash: string,
    perfil = 'usuario'
  ) {
    return prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        perfil
      }
    });
  }
}
