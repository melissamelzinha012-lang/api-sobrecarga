import { Router } from "express";
import { exigirLoginPagina } from "../middlewares/auth";
import provaTrabalhoRepository from "../repositories/provaTrabalhoRepository";
import { painelAvaliacoes } from "../services/painelService";

// Páginas (HTML) das seções do menu lateral.
// Os dados são lidos/alterados pelas APIs em /api/*.
const router = Router();

router.get("/provas", exigirLoginPagina, async (req, res) => {
  try {
    const usuarioId = Number(req.session.usuario?.id);
    const provas = await provaTrabalhoRepository.listar(usuarioId);
    res.render("provas/index", { provas, painel: painelAvaliacoes(provas) });
  } catch (erro) {
    console.error("Erro ao carregar provas:", erro);
    res.status(500).send("Erro ao carregar provas e trabalhos.");
  }
});

router.get("/estudos", exigirLoginPagina, (_req, res) => {
  res.render("estudo/index");
});

router.get("/tarefas", exigirLoginPagina, (_req, res) => {
  res.render("tarefas/index");
});

export default router;
