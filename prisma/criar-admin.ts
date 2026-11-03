// Cria (ou atualiza) uma conta de administrador do Dayly.
//
// Uso:
//   npm run admin:criar
//   npm run admin:criar -- --email=admin@dayly.com --senha=MinhaSenhaForte --nome="Administrador"
//
// Se a senha não for informada, uma senha aleatória é gerada e exibida no terminal.
// Se o e-mail já existir, a conta vira ADMIN e recebe a nova senha.

import "dotenv/config";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function argumento(nome: string): string | undefined {
  const prefixo = `--${nome}=`;
  const valor = process.argv.find((arg) => arg.startsWith(prefixo));
  return valor?.slice(prefixo.length);
}

function gerarSenha(): string {
  // 16 caracteres sem símbolos ambíguos (0/O, 1/l/I)
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(16);
  return Array.from(bytes, (b) => caracteres[b % caracteres.length]).join("");
}

async function main() {
  const email = (argumento("email") ?? process.env.ADMIN_EMAIL ?? "admin@dayly.com").trim().toLowerCase();
  const nome = argumento("nome") ?? process.env.ADMIN_NOME ?? "Administrador";
  const senhaInformada = argumento("senha") ?? process.env.ADMIN_SENHA;
  const senha = senhaInformada ?? gerarSenha();

  if (senha.length < 8) {
    throw new Error("A senha precisa ter pelo menos 8 caracteres.");
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: { senhaHash, perfil: "ADMIN" },
    create: { nome, email, senhaHash, perfil: "ADMIN" },
  });

  console.log("\nConta de administrador pronta:");
  console.log(`  ID:     ${usuario.id}`);
  console.log(`  Nome:   ${usuario.nome}`);
  console.log(`  E-mail: ${usuario.email}`);
  console.log(`  Senha:  ${senhaInformada ? "(a que você informou)" : senha}`);
  console.log(`  Perfil: ${usuario.perfil}\n`);
}

main()
  .catch((erro) => {
    console.error("Erro ao criar administrador:", erro instanceof Error ? erro.message : erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
