import { useEffect, useState } from "react";

interface Compromisso {
  id: number;
  titulo: string;
  disciplina: string;
  data: string;
  tipo: "PROVA" | "TRABALHO" | "ESTUDO";
}

export default function ResumoCompromissos() {
  const [dados, setDados] = useState<Compromisso[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await fetch("/api/compromissos");

        if (!resposta.ok) {
          throw new Error("Falha ao carregar.");
        }

        const compromissos = await resposta.json();
        setDados(compromissos);
      } catch {
        setErro("Não foi possível carregar o resumo.");
      }
    }

    carregar();
  }, []);

  const provas = dados.filter((item) => item.tipo === "PROVA");
  const trabalhos = dados.filter((item) => item.tipo === "TRABALHO");
  const estudos = dados.filter((item) => item.tipo === "ESTUDO");

  const proximos = [...dados]
    .filter((item) => {
      const data = new Date(item.data);
      const hoje = new Date();

      hoje.setHours(0, 0, 0, 0);
      data.setHours(0, 0, 0, 0);

      return data >= hoje;
    })
    .sort(
      (a, b) =>
        new Date(a.data).getTime() - new Date(b.data).getTime()
    )
    .slice(0, 5);

  return (
    <section>
      <h2>Resumo escolar</h2>

      {erro && <p role="alert">{erro}</p>}

      <div>
        <p>Provas: {provas.length}</p>
        <p>Trabalhos: {trabalhos.length}</p>
        <p>Estudos: {estudos.length}</p>
      </div>

      <h3>Próximos compromissos</h3>

      {proximos.length === 0 ? (
        <p>Nenhum compromisso futuro cadastrado.</p>
      ) : (
        <ul>
          {proximos.map((item) => (
            <li key={item.id}>
              <strong>{item.titulo}</strong> — {item.disciplina}
              {" | "}
              {new Date(item.data).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
              })}
              {" | "}
              {item.tipo}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}