
import { Router } from "express";
import { EstudoController } from "../controllers/EstudoController";
const router = Router();
const controller = new EstudoController();

router.get("/", (req, res) => controller.listar(req, res));

router.get("/horarios-livres", (req, res) =>
  controller.horariosLivres(req, res)
);

router.post("/gerar", (req, res) => controller.gerar(req, res));

router.patch("/:id/concluir", (req, res) =>
  controller.concluir(req, res)
);

router.post("/reorganizar", (req, res) =>
  controller.reorganizar(req, res)
);

export default router;
