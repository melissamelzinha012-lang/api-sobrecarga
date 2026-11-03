# Dayly

Sistema web para organizar a rotina de estudantes. Reúne compromissos, provas, trabalhos, tarefas e um planejador de estudos em um só lugar.

Feito com **Node.js + Express + TypeScript**. As páginas usam **EJS** e os dados ficam em **MySQL** via **Prisma**.

## Funcionalidades

| Seção | O que faz |
|---|---|
| **Login e cadastro** | Conta com e-mail e senha (senha guardada com bcrypt). A sessão dura 8 horas. |
| **Dashboard** | Visão geral da semana e atalhos para cada seção. |
| **Compromissos** | Cadastrar, editar e excluir compromissos com data e horário. Painel com os compromissos de hoje, dos próximos 7 dias, o tempo agendado na semana e o próximo compromisso. |
| **Provas e trabalhos** | Cadastrar avaliações (prova ou trabalho) com disciplina, data e horário. Painel com as próximas avaliações e a distribuição das próximas 4 semanas. |
| **Estudos** | Gera sessões de estudo de 50 min nos horários livres (8h às 21h), sem conflitar com compromissos. Também reorganiza sessões atrasadas. |
| **Tarefas** | Lista de tarefas com prazo, prioridade e status. |

Cada usuário vê apenas os próprios dados.

## Requisitos

- Node.js 20 ou superior
- MySQL 8 rodando localmente (ou acessível pela rede)

## Como rodar

1. **Instale as dependências**

   ```bash
   npm install
   ```

2. **Configure o ambiente.** Copie o arquivo de exemplo:

   ```bash
   copy .env.example .env      # Windows
   cp .env.example .env        # Linux/macOS
   ```

   Edite o `.env`:

   ```env
   PORT=3000
   SESSION_SECRET=troque-por-uma-frase-longa-e-secreta
   DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/ponte"
   ```

3. **Crie o banco** (vazio) no MySQL:

   ```sql
   CREATE DATABASE IF NOT EXISTS ponte
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   ```

4. **Crie as tabelas** com as migrations:

   ```bash
   npm run prisma:migrate
   ```

5. **Crie uma conta de administrador** (opcional):

   ```bash
   npm run admin:criar
   ```

   O comando gera uma senha aleatória e mostra no terminal. Para escolher os dados:

   ```bash
   npm run admin:criar -- --email=voce@exemplo.com --senha=SuaSenhaForte --nome="Seu Nome"
   ```

   Se o e-mail já existir, a conta vira administrador e recebe a nova senha.

6. **Inicie o servidor:**

   ```bash
   npm run dev
   ```

   Acesse <http://localhost:3000>.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento (recarrega ao salvar). |
| `npm run build` | Compila o TypeScript para `dist/`. |
| `npm start` | Roda a versão compilada (`dist/server.js`). |
| `npm run prisma:migrate` | Aplica/cria migrations no banco. |
| `npm run prisma:generate` | Regenera o cliente do Prisma depois de mudar o schema. |
| `npm run prisma:studio` | Abre uma interface web para ver e editar os dados do banco. |
| `npm run admin:criar` | Cria ou promove uma conta de administrador. |

## Estrutura

```
prisma/
  schema.prisma          # modelos: Usuario, Compromisso, Estudo, Tarefa
  migrations/            # histórico de alterações do banco
  criar-admin.ts         # script do "npm run admin:criar"
src/
  server.ts              # sobe o servidor
  app.ts                 # configuração do Express e registro das rotas
  routes/                # definição das URLs
  controllers/           # recebem a requisição e respondem
  services/              # regras de negócio (planejador de estudos, painéis)
  repositories/          # acesso ao banco via Prisma
  middlewares/auth.ts    # exige login (API → 401, página → redireciona)
  views/                 # páginas EJS/HTML
    partials/            # menu lateral e painel reutilizáveis
  public/                # CSS, imagens e JS do navegador
```

## Rotas

**Páginas** (exigem login, exceto login e cadastro):

| URL | Página |
|---|---|
| `/login`, `/cadastro` | Entrar / criar conta |
| `/dashboard` | Início |
| `/compromissos`, `/compromissos/novo`, `/compromissos/:id/editar` | Compromissos |
| `/provas` | Provas e trabalhos |
| `/estudos` | Planejador de estudos |
| `/tarefas` | Tarefas |
| `/admin`, `/admin/usuarios` | Área administrativa (somente administradores) |
| `/logout` | Sai da conta |

**APIs JSON** (usadas pelo JavaScript das páginas, exigem login):

| Prefixo | Recurso |
|---|---|
| `/api/compromissos` | Provas e trabalhos: `GET`, `POST`, `PUT /:id`, `DELETE /:id` |
| `/api/estudos` | `GET`, `GET /horarios-livres`, `POST /gerar`, `PATCH /:id/concluir`, `POST /reorganizar` |
| `/api/tarefas` | `GET`, `GET /:id`, `POST`, `PUT /:id`, `PATCH /:id/concluir`, `DELETE /:id` |

## Perfis de usuário

Administradores e usuários comuns entram pela **mesma tela de login** (`/login`). O sistema identifica o perfil pela conta e leva cada um para o lugar certo:

| | Usuário comum | Administrador |
|---|---|---|
| Depois do login | `/dashboard` | `/admin` |
| Minha rotina (dashboard, compromissos, provas, estudos, tarefas) | ✓ | ✓ |
| Menu "Administração" | — | ✓ |
| Visão geral do sistema (`/admin`) | — | ✓ |
| Gerenciar usuários (`/admin/usuarios`) | — | ✓ |

Toda conta criada pela tela de cadastro tem perfil `usuario`. Para criar o primeiro administrador, use `npm run admin:criar`. Depois disso, novos administradores podem ser criados pela própria tela de usuários.

### Área administrativa

- **Visão geral** (`/admin`): total de usuários e administradores, cadastros dos últimos 7 dias, quanto cada seção é usada em todas as contas (compromissos, provas e trabalhos, tarefas e sessões de estudo, com a taxa de conclusão), gráfico de novos cadastros dos últimos 14 dias e os cadastros mais recentes.
- **Usuários** (`/admin/usuarios`): busca por nome ou e-mail, quanto cada conta usa o sistema, **tornar admin / remover admin** e **excluir conta** (apaga também os compromissos, tarefas e estudos dela, com confirmação).

Regras de segurança:

- A permissão é conferida no banco a cada acesso. Ao remover o admin de alguém, a mudança vale na hora, mesmo que essa pessoa já esteja logada.
- Um administrador não pode remover a própria permissão nem excluir a própria conta.
- O sistema sempre mantém pelo menos um administrador.
- Um usuário comum que tenta abrir `/admin` vê uma página de "Área restrita" (HTTP 403).
