
import { Router } from "express";
import { TarefaController } from "../controllers/TarefaController";
import { verificarLogin } from "../middlewares/auth";

const router = Router();
const controller = new TarefaController();

// Todas as rotas exigem login
router.use(verificarLogin);

// Listar tarefas
router.get("/", (req, res) => controller.listar(req, res));

// Buscar uma tarefa
router.get("/:id", (req, res) => controller.buscar(req, res));

// Cadastrar tarefa
router.post("/", (req, res) => controller.criar(req, res));

// Editar tarefa
router.put("/:id", (req, res) => controller.atualizar(req, res));

// Marcar como concluída
router.patch("/:id/concluir", (req, res) => controller.concluir(req, res));

// Excluir tarefa
router.delete("/:id", (req, res) => controller.excluir(req, res));

export default router;
