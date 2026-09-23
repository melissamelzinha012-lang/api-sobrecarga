import { Router } from "express";
import bcrypt from "bcrypt";
import { UsuarioRepository } from "../repositories/usuarioRepository";

const router = Router();
const usuarioRepository = new UsuarioRepository();

router.post("/cadastro", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const usuarioExistente =
      await usuarioRepository.buscarPorEmail(email);

    if (usuarioExistente) {
      return res.status(400).json({
        mensagem: "E-mail já cadastrado"
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await usuarioRepository.criar(
      nome,
      email,
      senhaHash
    );

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao cadastrar usuário"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario =
      await usuarioRepository.buscarPorEmail(email);

    if (!usuario) {
      return res.status(401).json({
        mensagem: "Email ou senha inválidos"
      });
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha_hash
    );

    if (!senhaValida) {
      return res.status(401).json({
        mensagem: "Email ou senha inválidos"
      });
    }

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil
    };

    return res.status(200).json({
      mensagem: "Login realizado com sucesso"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao realizar login"
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

export default router;