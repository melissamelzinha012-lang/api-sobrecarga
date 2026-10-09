import { useEffect, useState } from "react";

interface Compromisso {
  id: number;
  titulo: string;
  disciplina: string;
  data: string;
  horario?: string | null;
  tipo: "PROVA" | "TRABALHO" | "ESTUDO";
}

export default function Calendario() {
  const [mes, setMes] = useState(new Date());
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [erro, setErro] = useState("");

  const ano = mes.getFullYear();
  const numeroMes = mes.getMonth();
  const primeiroDia = new Date(ano, numeroMes, 1).getDay();
  const diasNoMes = new Date(ano, numeroMes + 1, 0).getDate();

  useEffect(() => {
    async function carregarCompromissos() {
      try {
        setErro("");

        const resposta = await fetch("/api/compromissos");

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os compromissos.");
        }

        const dados = await resposta.json();
        setCompromissos(dados);
      } catch {
        setErro("Erro ao carregar o calendário.");
      }
    }

    carregarCompromissos();
  }, []);

  function mudarMes(valor: number) {
    setMes(new Date(ano, numeroMes + valor, 1));
  }

  function compromissosDoDia(dia: number) {
    return compromissos.filter((item) => {
      const data = new Date(item.data);

      return (
        data.getFullYear() === ano &&
        data.getMonth() === numeroMes &&
        data.getDate() === dia
      );
    });
  }

  return (
    <main>
      <h1>Calendário escolar</h1>

      <div>
        <button onClick={() => mudarMes(-1)}>Anterior</button>

        <h2>
          {mes.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <button onClick={() => mudarMes(1)}>Próximo</button>
      </div>

      {erro && <p role="alert">{erro}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: "6px",
        }}
      >
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
          <strong key={dia}>{dia}</strong>
        ))}

        {Array.from({ length: primeiroDia }, (_, i) => (
          <div key={`vazio-${i}`} />
        ))}

        {Array.from({ length: diasNoMes }, (_, i) => {
          const dia = i + 1;
          const itens = compromissosDoDia(dia);

          return (
            <div
              key={dia}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "8px",
                minHeight: "100px",
                overflowWrap: "anywhere",
              }}
            >
              <strong>{dia}</strong>

              {itens.map((item) => (
                <div
                  key={item.id}
                  style={{
                    marginTop: "6px",
                    padding: "5px",
                    background:
                      item.tipo === "PROVA"
                        ? "#fee2e2"
                        : item.tipo === "TRABALHO"
                          ? "#dbeafe"
                          : "#dcfce7",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  <strong>{item.tipo}</strong>
                  <p>{item.titulo}</p>
                  <span>{item.disciplina}</span>
                  {item.horario && <p>{item.horario}</p>}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </main>
  );
}
