import type { DadosCompromisso } from "./provaService";

export async function cadastrarTrabalho(dados: DadosCompromisso) {
  const resposta = await fetch("/api/compromissos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...dados,
      tipo: "TRABALHO",
    }),
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.mensagem || "Erro ao cadastrar trabalho.");
  }

  return resultado;
}