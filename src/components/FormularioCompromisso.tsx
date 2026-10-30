import { useState, FormEvent } from "react";

interface Props {
  aoSalvar: () => void;
}

export default function FormularioCompromisso({ aoSalvar }: Props) {
  const [titulo, setTitulo] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [tipo, setTipo] = useState("PROVA");
  const [mensagem, setMensagem] = useState("");

  async function cadastrar(event: FormEvent) {
    event.preventDefault();
    setMensagem("");

    try {
      const resposta = await fetch("/api/compromissos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          disciplina,
          descricao,
          data,
          horario: horario || undefined,
          tipo,
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        setMensagem(resultado.mensagem || "Não foi possível cadastrar.");
        return;
      }

      setTitulo("");
      setDisciplina("");
      setDescricao("");
      setData("");
      setHorario("");
      setTipo("PROVA");
      setMensagem("Cadastro realizado com sucesso!");
      aoSalvar();
    } catch {
      setMensagem("Erro de conexão com o servidor.");
    }
  }

  return (
    <form onSubmit={cadastrar}>
      <h2>Cadastrar compromisso</h2>

      <label htmlFor="titulo">Título</label>
      <input
        id="titulo"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
      />

      <label htmlFor="disciplina">Disciplina</label>
      <input
        id="disciplina"
        value={disciplina}
        onChange={(e) => setDisciplina(e.target.value)}
        required
      />

      <label htmlFor="tipo">Tipo</label>
      <select
        id="tipo"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
      >
        <option value="PROVA">Prova</option>
        <option value="TRABALHO">Trabalho</option>
        <option value="ESTUDO">Estudo</option>
      </select>

      <label htmlFor="data">Data</label>
      <input
        id="data"
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        required
      />

      <label htmlFor="horario">Horário</label>
      <input
        id="horario"
        type="time"
        value={horario}
        onChange={(e) => setHorario(e.target.value)}
      />

      <label htmlFor="descricao">Descrição</label>
      <textarea
        id="descricao"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      <button type="submit">Cadastrar</button>

      {mensagem && <p role="status">{mensagem}</p>}
    </form>
  );
}