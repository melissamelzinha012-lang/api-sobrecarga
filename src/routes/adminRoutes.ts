import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { exigirAdmin } from "../middlewares/auth";

const router = Router();
const controller = new AdminController();

// Toda a área /admin é exclusiva de administradores.
router.use(exigirAdmin);

router.get("/", (req, res) => controller.index(req, res));
router.get("/usuarios", (req, res) => controller.usuarios(req, res));
router.post("/usuarios/:id/perfil", (req, res) => controller.alterarPerfil(req, res));
router.post("/usuarios/:id/excluir", (req, res) => controller.excluir(req, res));

export default router;
