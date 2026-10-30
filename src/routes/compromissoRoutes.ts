
import { Router } from "express";

import { CompromissoController } from "../controllers/compromissoController";

const router = Router();

const compromissoController = new CompromissoController();

// Abrir formulário de novo compromisso
router.get(
  "/novo",
  compromissoController.novo.bind(compromissoController)
);

// Listar compromissos
router.get(
  "/",
  compromissoController.listar.bind(compromissoController)
);

router.post(
  "/:id/editar",
  compromissoController.atualizar.bind(compromissoController)
);

router.post(
  "/:id/excluir",
  compromissoController.excluir.bind(compromissoController)
);


// Buscar compromisso por ID
router.get(
  "/:id",
  compromissoController.buscarPorId.bind(compromissoController)
);

router.post(
  "/:id/excluir",
  compromissoController.excluir.bind(compromissoController)
);


// Criar compromisso
router.post(
  "/",
  compromissoController.criar.bind(compromissoController)
);

// Editar compromisso
router.put(
  "/:id",
  compromissoController.atualizar.bind(compromissoController)
);

// Excluir compromisso
router.delete(
  "/:id",
  compromissoController.excluir.bind(compromissoController)
);

export default router;
