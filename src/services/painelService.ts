// Monta os números do "painel" exibido no topo das páginas de
// compromissos e de provas/trabalhos.

export interface ItemAgenda {
  titulo: string;
  data: Date;
  horarioInicio: Date;
  horarioFim?: Date | null;
  tipo?: string | null;
}

export interface CartaoPainel {
  rotulo: string;
  valor: string;
  detalhe?: string;
}

export interface BarraPainel {
  rotulo: string;
  detalhe: string;
  quantidade: number;
  destaque: boolean;
}

export interface ProximoItem {
  titulo: string;
  data: string;
  horario: string;
  relativo: string;
  tipo?: string | null;
}

const DIA_MS = 24 * 60 * 60 * 1000;
const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

// A data vem de uma coluna DATE (meia-noite UTC) e o horário de uma coluna
// TIME (1970-01-01 em UTC). Junta os dois em um Date no fuso local.
export function inicioDoItem(item: ItemAgenda): Date {
  const d = new Date(item.data);
  const h = new Date(item.horarioInicio);
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    h.getUTCHours(),
    h.getUTCMinutes()
  );
}

function diaLocal(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function diasEntre(de: Date, ate: Date): number {
  return Math.round((diaLocal(ate).getTime() - diaLocal(de).getTime()) / DIA_MS);
}

function duracaoMinutos(item: ItemAgenda): number {
  if (!item.horarioFim) return 0;
  const inicio = new Date(item.horarioInicio).getTime();
  let fim = new Date(item.horarioFim).getTime();
  if (fim <= inicio) fim += DIA_MS; // termina depois da meia-noite
  return Math.round((fim - inicio) / 60_000);
}

function formatarHoras(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto}min`;
  return resto === 0 ? `${horas}h` : `${horas}h${String(resto).padStart(2, "0")}`;
}

function textoRelativo(dias: number): string {
  if (dias <= 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  return `Em ${dias} dias`;
}

function proximoItem(itens: ItemAgenda[], agora: Date): ProximoItem | null {
  const futuro = itens
    .map((item) => ({ item, inicio: inicioDoItem(item) }))
    .filter(({ inicio }) => inicio >= agora)
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime())[0];

  if (!futuro) return null;

  return {
    titulo: futuro.item.titulo,
    tipo: futuro.item.tipo,
    data: futuro.inicio.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    }),
    horario: futuro.inicio.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    relativo: textoRelativo(diasEntre(agora, futuro.inicio)),
  };
}

// Quantos itens começam em cada um dos próximos `dias` dias (contando hoje).
function contarPorDia(itens: ItemAgenda[], agora: Date, dias: number) {
  const contagem = new Array(dias).fill(0);
  for (const item of itens) {
    const indice = diasEntre(agora, inicioDoItem(item));
    if (indice >= 0 && indice < dias) contagem[indice]++;
  }
  return contagem;
}

export function painelCompromissos(itens: ItemAgenda[], agora = new Date()) {
  const porDia = contarPorDia(itens, agora, 7);
  const daSemana = itens.filter((item) => {
    const indice = diasEntre(agora, inicioDoItem(item));
    return indice >= 0 && indice < 7;
  });
  const minutosSemana = daSemana.reduce((soma, item) => soma + duracaoMinutos(item), 0);
  const proximos = itens.filter((item) => inicioDoItem(item) >= agora).length;

  const cartoes: CartaoPainel[] = [
    { rotulo: "Hoje", valor: String(porDia[0]), detalhe: porDia[0] === 1 ? "compromisso" : "compromissos" },
    { rotulo: "Próximos 7 dias", valor: String(daSemana.length), detalhe: "incluindo hoje" },
    { rotulo: "Tempo agendado na semana", valor: formatarHoras(minutosSemana), detalhe: "somando os horários" },
    { rotulo: "Ainda por vir", valor: String(proximos), detalhe: `de ${itens.length} cadastrados` },
  ];

  const barras: BarraPainel[] = porDia.map((quantidade, i) => {
    const dia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + i);
    return {
      rotulo: i === 0 ? "Hoje" : DIAS_SEMANA[dia.getDay()],
      detalhe: dia.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      quantidade,
      destaque: i === 0,
    };
  });

  return {
    cartoes,
    proximo: proximoItem(itens, agora),
    barras,
    tituloGrafico: "Compromissos nos próximos 7 dias",
    unidade: ["compromisso", "compromissos"],
  };
}

export function painelAvaliacoes(itens: ItemAgenda[], agora = new Date()) {
  const futuras = itens.filter((item) => inicioDoItem(item) >= agora);
  const provas = futuras.filter((item) => item.tipo === "PROVA").length;
  const trabalhos = futuras.filter((item) => item.tipo === "TRABALHO").length;
  const em7dias = futuras.filter((item) => diasEntre(agora, inicioDoItem(item)) < 7).length;

  const porDia = contarPorDia(itens, agora, 28);
  const barras: BarraPainel[] = [0, 1, 2, 3].map((semana) => {
    const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + semana * 7);
    const fim = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    return {
      rotulo: semana === 0 ? "Esta semana" : `Semana ${semana + 1}`,
      detalhe: `${fmt(inicio)} a ${fmt(fim)}`,
      quantidade: porDia.slice(semana * 7, semana * 7 + 7).reduce((a, b) => a + b, 0),
      destaque: semana === 0,
    };
  });

  const cartoes: CartaoPainel[] = [
    { rotulo: "Próximos 7 dias", valor: String(em7dias), detalhe: em7dias === 1 ? "avaliação" : "avaliações" },
    { rotulo: "Provas pela frente", valor: String(provas) },
    { rotulo: "Trabalhos pela frente", valor: String(trabalhos) },
    { rotulo: "Já realizadas", valor: String(itens.length - futuras.length), detalhe: `de ${itens.length} cadastradas` },
  ];

  return {
    cartoes,
    proximo: proximoItem(itens, agora),
    barras,
    tituloGrafico: "Avaliações nas próximas 4 semanas",
    unidade: ["avaliação", "avaliações"],
  };
}
