
import { Router } from "express";

import { CompromissoController } from "../controllers/compromissoController";

const router = Router();

const compromissoController = new CompromissoController();

router.get(
  "/",
  compromissoController.listar.bind(compromissoController)
);

router.get(
  "/:id",
  compromissoController.buscarPorId.bind(compromissoController)
);

router.post(
  "/",
  compromissoController.criar.bind(compromissoController)
);

router.put(
  "/:id",
  compromissoController.atualizar.bind(compromissoController)
);

router.delete(
  "/:id",
  compromissoController.excluir.bind(compromissoController)
);

export default router;