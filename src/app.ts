import express from 'express';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboardRoutes';
import compromissoRoutes from './routes/compromissoRoutes';
import provaTrabalhoRoutes from './routes/ProvaTrabalhoRoutes';
import estudoRoutes from './routes/EstudoRoutes';
import tarefaRoutes from './routes/tarefas.Routes';
import paginasRoutes from './routes/paginasRoutes';
import adminRoutes from './routes/adminRoutes';
import { exigirLoginPagina, verificarLogin } from './middlewares/auth';

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'chave-local',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8
  }
}));

// Deixa o usuário logado disponível em todas as views (menu lateral, perfil).
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario ?? null;
  next();
});

// Páginas acessadas pelo navegador.
app.get('/', (_req, res) => res.redirect('/login'));
app.get('/login', (_req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/cadastro', (_req, res) => res.sendFile(path.join(__dirname, 'views', 'cadastro.html')));

// Rotas de autenticação: POST /login, POST /cadastro e GET /logout.
app.use('/', authRoutes);
app.use('/dashboard', exigirLoginPagina, dashboardRoutes);
app.use('/compromissos', compromissoRoutes);

// Páginas do menu lateral: /provas, /estudos e /tarefas.
app.use('/', paginasRoutes);

// Área administrativa (somente perfil ADMIN).
app.use('/admin', adminRoutes);

// APIs (JSON) usadas pelo JavaScript dessas páginas.
app.use('/api/compromissos', verificarLogin, provaTrabalhoRoutes);
app.use('/api/estudos', verificarLogin, estudoRoutes);
app.use('/api/tarefas', tarefaRoutes);

export default app;
