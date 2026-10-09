export async function editarCompromisso(
  id: number,
  dados: Record<string, unknown>
) {
  const resposta = await fetch(`/api/compromissos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.mensagem || "Erro ao editar compromisso.");
  }

  return resultado;
}

export async function excluirCompromisso(id: number) {
  const resposta = await fetch(`/api/compromissos/${id}`, {
    method: "DELETE",
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.mensagem || "Erro ao excluir compromisso.");
  }

  return resultado;
}