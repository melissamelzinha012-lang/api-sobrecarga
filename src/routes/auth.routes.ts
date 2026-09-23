import { Router } from "express";

const router = Router();

router.post("/login", (req, res) => {
  res.status(200).json({
    mensagem: "Rota de login funcionando"
  });
});

router.post("/cadastro", (req, res) => {
  res.status(200).json({
    mensagem: "Rota de cadastro funcionando"
  });
});

export default router;