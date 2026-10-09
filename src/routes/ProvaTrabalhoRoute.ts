import { Router } from "express";
import controller from "../controllers/ProvaTrabalhoController";

const router = Router();

router.get("/", (req, res) => controller.listar(req, res));

router.get("/:id", (req, res) =>
  controller.buscarPorId(req, res)
);

router.post("/", (req, res) => controller.criar(req, res));

router.put("/:id", (req, res) =>
  controller.atualizar(req, res)
);

router.delete("/:id", (req, res) =>
  controller.excluir(req, res)
);

export default router;