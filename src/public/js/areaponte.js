const form = document.querySelector("#form-estudo");
const lista = document.querySelector("#lista-estudos");
const mensagem = document.querySelector("#mensagem");

function usuarioId() {
  return Number(document.querySelector("#usuarioId").value);
}

function mostrarMensagem(texto) {
  mensagem.textContent = texto;
}

async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...opcoes.headers,
    },
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || "Não foi possível completar a operação.");
  }

  return dados;
}

function criarSessao(estudo) {
  const artigo = document.createElement("article");
  artigo.className = `sessao ${estudo.concluido ? "concluido" : ""}`;

  const informacoes = document.createElement("div");
  const titulo = document.createElement("strong");
  const horario = document.createElement("p");
  const estado = document.createElement("p");

  titulo.textContent = estudo.materia;
  horario.textContent =
    `${new Date(estudo.inicio).toLocaleString("pt-BR")} — ` +
    `${new Date(estudo.fim).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

  estado.textContent = estudo.concluido ? "Concluído" : "Pendente";

  informacoes.append(titulo, horario, estado);
  artigo.append(informacoes);

  if (!estudo.concluido) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = "Concluir";

    botao.addEventListener("click", async () => {
      try {
        await requisicao(
          `/api/estudos/${estudo.id}/concluir`,
          {
            method: "PATCH",
            body: JSON.stringify({ usuarioId: usuarioId() }),
          }
        );

        mostrarMensagem("Sessão concluída!");
        await carregarEstudos();
      } catch (erro) {
        mostrarMensagem(erro.message);
      }
    });

    artigo.append(botao);
  }

  return artigo;
}

async function carregarEstudos() {
  try {
    const id = usuarioId();

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Informe um ID de usuário válido.");
    }

    const estudos = await requisicao(
      `/api/estudos?usuarioId=${encodeURIComponent(id)}`
    );

    lista.replaceChildren();

    if (!estudos.length) {
      lista.textContent = "Nenhuma sessão cadastrada.";
      return;
    }

    estudos.forEach((estudo) => {
      lista.append(criarSessao(estudo));
    });

    mostrarMensagem(`${estudos.length} sessão(ões) encontrada(s).`);
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  try {
    const dados = {
      usuarioId: usuarioId(),
      materia: document.querySelector("#materia").value,
      prazo: new Date(
        document.querySelector("#prazo").value
      ).toISOString(),
      duracaoMinutos: Number(
        document.querySelector("#duracaoMinutos").value
      ),
    };

    if (!dados.usuarioId || !Number.isFinite(dados.prazo)) {
      throw new Error("Preencha o usuário e o prazo corretamente.");
    }

    const sessoes = await requisicao("/api/estudos/gerar", {
      method: "POST",
      body: JSON.stringify(dados),
    });

    mostrarMensagem(`${sessoes.length} sessão(ões) criada(s).`);
    await carregarEstudos();
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
});

document.querySelector("#btn-listar").addEventListener(
  "click",
  carregarEstudos
);

document.querySelector("#btn-reorganizar").addEventListener(
  "click",
  async () => {
    try {
      const resultado = await requisicao("/api/estudos/reorganizar", {
        method: "POST",
        body: JSON.stringify({ usuarioId: usuarioId() }),
      });

      mostrarMensagem(
        `${resultado.quantidade} estudo(s) reorganizado(s).`
      );

      await carregarEstudos();
    } catch (erro) {
      mostrarMensagem(erro.message);
    }
  }
);