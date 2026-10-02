# Configuração do Prisma

O projeto agora usa Prisma como camada de acesso ao MySQL.

## Primeira execução

1. Copie `.env.example` para `.env`:

```bash
copy .env.example .env
```

No Linux/macOS:

```bash
cp .env.example .env
```

2. Edite `DATABASE_URL` com a senha do seu MySQL:

```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/ponte"
```

3. Crie o banco vazio no MySQL:

```sql
CREATE DATABASE IF NOT EXISTS sobrecarga_bd
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

4. Instale as dependências e gere o cliente:

```bash
npm install
npm run prisma:generate
```

5. Crie a tabela `usuarios` por migração:

```bash
npx prisma migrate dev --name init
```

6. Inicie a API:

```bash
npm run dev
```

## Comandos úteis

```bash
npm run build
npm run prisma:generate
npx prisma migrate dev --name nome-da-mudanca
npm run prisma:studio
```

## O que mudou

- Foi adicionado `prisma/schema.prisma` com o modelo `Usuario`.
- Foi adicionado `src/config/database/prisma.ts`, que exporta o `PrismaClient`.
- O `UsuarioRepository` deixou de executar SQL manual e passou a usar `prisma.usuario.findUnique` e `prisma.usuario.create`.
- O login passou a ler `usuario.senhaHash`; o Prisma mapeia esse campo para a coluna `senha_hash` com `@map`.
- O modelo Prisma `Usuario` usa a tabela existente `usuarios` com `@@map("usuarios")`.
- O `app.ts` registra `/auth` e `/dashboard`.
- O `tsconfig.json` foi movido para a raiz e ajustado para compilar `src`.
- O `package.json` ganhou scripts de desenvolvimento, build, migração e Prisma Studio.
- A conexão antiga com `mysql2` foi removida do fluxo da aplicação.

## Observação

O arquivo `.env` contém credenciais e não deve ser enviado ao Git. Use `.env.example` como modelo.
