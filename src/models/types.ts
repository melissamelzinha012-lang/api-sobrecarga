import 'express-session';

export type Perfil = 'ESTUDANTE' | 'ADMIN';

export type StatusItem = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export type StatusEstudo = 'PENDENTE' | 'CONCLUIDO' | 'NAO_REALIZADO';

export interface UsuarioSessao {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

declare module 'express-session' {
  interface SessionData {
    usuario?: UsuarioSessao;
  }
}