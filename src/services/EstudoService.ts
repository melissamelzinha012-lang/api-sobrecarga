import { EstudoRepository } from "../repositories/EstudoRepository";

const repository = new EstudoRepository();

const DURACAO_SESSAO = 50;
const INTERVALO = 10;
const HORA_INICIO = 8;
const HORA_FIM = 21;

type Compromisso = {
  inicio: Date;
  fim: Date;
};

function mesmoDia(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function somarMinutos(data: Date, minutos: number): Date {
  return new Date(data.getTime() + minutos * 60_000);
}

function sobrepoe(
  inicio: Date,
  fim: Date,
  outroInicio: Date,
  outroFim: Date
): boolean {
  return inicio < outroFim && fim > outroInicio;
}

export class EstudoService {
  async listar(usuarioId: number) {
    return repository.listarPorUsuario(usuarioId);
  }

  async concluir(id: number, usuarioId: number) {
    const estudo = await repository.buscarPorId(id, usuarioId);

    if (!estudo) {
      throw new Error("Sessão de estudo não encontrada.");
    }

    return repository.marcarComoConcluido(id, usuarioId);
  }

  async buscarHorariosLivres(
    usuarioId: number,
    dataInicial: Date,
    dataFinal: Date
  ) {
    if (
      Number.isNaN(dataInicial.getTime()) ||
      Number.isNaN(dataFinal.getTime()) ||
      dataInicial >= dataFinal
    ) {
      throw new Error("Informe um intervalo de datas válido.");
    }

    const [compromissos, estudos] = await Promise.all([
      repository.listarCompromissos(usuarioId),
      repository.listarPorUsuario(usuarioId),
    ]);

    const ocupados = [
      ...compromissos.map((item) => ({
        inicio: new Date(item.inicio),
        fim: new Date(item.fim),
      })),
      ...estudos
        .filter((item) => !item.concluido)
        .map((item) => ({
          inicio: new Date(item.inicio),
          fim: new Date(item.fim),
        })),
    ];

    const horarios: Array<{ inicio: Date; fim: Date }> = [];
    const cursor = new Date(dataInicial);
    cursor.setHours(HORA_INICIO, 0, 0, 0);

    while (cursor < dataFinal) {
      if (cursor.getHours() >= HORA_FIM) {
        cursor.setDate(cursor.getDate() + 1);
        cursor.setHours(HORA_INICIO, 0, 0, 0);
        continue;
      }

      const inicio = new Date(cursor);
      const fim = somarMinutos(inicio, DURACAO_SESSAO);

      if (
        fim.getHours() <= HORA_FIM &&
        fim <= dataFinal &&
        !ocupados.some((item) =>
          sobrepoe(inicio, fim, item.inicio, item.fim)
        )
      ) {
        horarios.push({ inicio, fim });
      }

      cursor.setMinutes(cursor.getMinutes() + DURACAO_SESSAO + INTERVALO);
    }

    return horarios;
  }

  async gerarSessoes(
    usuarioId: number,
    materia: string,
    prazo: Date,
    duracaoMinutos: number
  ) {
    if (!materia.trim()) {
      throw new Error("Informe a matéria.");
    }

    if (Number.isNaN(prazo.getTime()) || prazo <= new Date()) {
      throw new Error("O prazo precisa ser uma data futura.");
    }

    if (!Number.isInteger(duracaoMinutos) || duracaoMinutos < 1) {
      throw new Error("A duração precisa ser um número positivo.");
    }

    const sessoesCriadas = [];
    let restante = duracaoMinutos;

    while (restante > 0) {
      const agora = new Date();
      const fimBusca = new Date(prazo);

      const horarios = await this.buscarHorariosLivres(
        usuarioId,
        agora,
        fimBusca
      );

      const horario = horarios[0];

      if (!horario) {
        throw new Error(
          "Não há horários suficientes antes do prazo. Tente ampliar o período."
        );
      }

      const duracao = Math.min(DURACAO_SESSAO, restante);
      const fim = somarMinutos(horario.inicio, duracao);

      const sessao = await repository.criar({
        usuarioId,
        materia: materia.trim(),
        inicio: horario.inicio,
        fim,
      });

      sessoesCriadas.push(sessao);
      restante -= duracao;
    }

    return sessoesCriadas;
  }

  async reorganizar(usuarioId: number) {
    const estudos = await repository.listarPorUsuario(usuarioId);
    const agora = new Date();

    const pendentes = estudos
      .filter((item) => !item.concluido && new Date(item.fim) < agora)
      .sort(
        (a, b) =>
          new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
      );

    const reagendados = [];

    for (const estudo of pendentes) {
      const horarios = await this.buscarHorariosLivres(
        usuarioId,
        agora,
        new Date(agora.getTime() + 7 * 24 * 60 * 60_000)
      );

      if (horarios.length === 0) {
        continue;
      }

      const horario = horarios[0];
      const duracao = Math.max(
        1,
        Math.ceil(
          (new Date(estudo.fim).getTime() -
            new Date(estudo.inicio).getTime()) /
            60_000
        )
      );

      const resultado = await repository.atualizarHorario(
        estudo.id,
        usuarioId,
        horario.inicio,
        somarMinutos(horario.inicio, duracao)
      );

      reagendados.push(resultado);
    }

    return {
      quantidade: reagendados.length,
      estudos: reagendados,
    };
  }
}