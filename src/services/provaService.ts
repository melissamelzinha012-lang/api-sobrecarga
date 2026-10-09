export interface DadosCompromisso {
  titulo: string;
  disciplina: string;
  descricao?: string;
  data: string;
  horario?: string;
}

export async function cadastrarProva(dados: DadosCompromisso) {
  const resposta = await fetch("/api/compromissos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...dados,
      tipo: "PROVA",
    }),
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.mensagem || "Erro ao cadastrar prova.");
  }

  return resultado;
}