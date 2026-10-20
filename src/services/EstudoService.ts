import { EstudoRepository } from "../repositories/EstudoRepository";

const repository = new EstudoRepository();

const DURACAO_SESSAO = 50;
const INTERVALO = 10;
const HORA_INICIO = 8;
const HORA_FIM = 21;

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

function inicioDoExpediente(data: Date): Date {
  const inicio = new Date(data);
  inicio.setHours(HORA_INICIO, 0, 0, 0);
  return inicio;
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
      ...compromissos.map((item: { inicio: string; fim: string }) => ({
        inicio: new Date(item.inicio),
        fim: new Date(item.fim),
      })),
      ...estudos
        .filter((item: { concluido: any; }) => !item.concluido)
        .map((item: { inicio: string | number | Date; fim: string | number | Date; }) => ({
          inicio: new Date(item.inicio),
          fim: new Date(item.fim),
        })),
    ];

    const horarios: Array<{ inicio: Date; fim: Date }> = [];

    let cursor = new Date(dataInicial);

    while (cursor < dataFinal) {
      const inicioExpediente = inicioDoExpediente(cursor);
      const fimExpediente = new Date(cursor);
      fimExpediente.setHours(HORA_FIM, 0, 0, 0);

      // Começa às 8h ou no horário inicial informado,
      // o que for mais tarde.
      let inicio = new Date(
        Math.max(cursor.getTime(), inicioExpediente.getTime())
      );

      // Avança para o próximo dia se já passou das 21h.
      if (inicio >= fimExpediente) {
        cursor.setDate(cursor.getDate() + 1);
        cursor = inicioDoExpediente(cursor);
        continue;
      }

      while (inicio < fimExpediente && inicio < dataFinal) {
        const fim = somarMinutos(inicio, DURACAO_SESSAO);

        if (
          fim <= fimExpediente &&
          fim <= dataFinal &&
          !ocupados.some((item) =>
            sobrepoe(inicio, fim, item.inicio, item.fim)
          )
        ) {
          horarios.push({
            inicio: new Date(inicio),
            fim: new Date(fim),
          });
        }

        inicio = somarMinutos(
          inicio,
          DURACAO_SESSAO + INTERVALO
        );
      }

      cursor.setDate(cursor.getDate() + 1);
      cursor = inicioDoExpediente(cursor);
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

    if (
      Number.isNaN(prazo.getTime()) ||
      prazo <= new Date()
    ) {
      throw new Error("O prazo precisa ser uma data futura.");
    }

    if (
      !Number.isInteger(duracaoMinutos) ||
      duracaoMinutos < 1
    ) {
      throw new Error(
        "A duração precisa ser um número inteiro positivo."
      );
    }

    const agora = new Date();

    const horarios = await this.buscarHorariosLivres(
      usuarioId,
      agora,
      prazo
    );

    let restante = duracaoMinutos;
    const sessoesCriadas = [];

    for (const horario of horarios) {
      if (restante <= 0) {
        break;
      }

      const duracao = Math.min(
        DURACAO_SESSAO,
        restante
      );

      const fim = somarMinutos(
        horario.inicio,
        duracao
      );

      const sessao = await repository.criar({
        usuarioId,
        materia: materia.trim(),
        inicio: horario.inicio,
        fim,
      });

      sessoesCriadas.push(sessao);
      restante -= duracao;
    }

    if (restante > 0) {
      throw new Error(
        `Não há horários suficientes antes do prazo. ` +
        `Faltam ${restante} minutos de estudo.`
      );
    }

    return sessoesCriadas;
  }

  async reorganizar(usuarioId: number) {
    const estudos = await repository.listarPorUsuario(usuarioId);
    const agora = new Date();

    const pendentes = estudos
      .filter(
        (item: { concluido: any; fim: string | number | Date; }) =>
          !item.concluido &&
          new Date(item.fim) < agora
      )
      .sort(
        (a: { inicio: string | number | Date; }, b: { inicio: string | number | Date; }) =>
          new Date(a.inicio).getTime() -
          new Date(b.inicio).getTime()
      );

    const reagendados: number[] = [];

    for (const estudo of pendentes) {
      const duracao = Math.ceil(
        (new Date(estudo.fim).getTime() -
          new Date(estudo.inicio).getTime()) /
          60_000
      );

      const horarios = await this.buscarHorariosLivres(
        usuarioId,
        agora,
        somarMinutos(agora, 7 * 24 * 60)
      );

      const horario = horarios.find((item) => {
        const fim = somarMinutos(item.inicio, duracao);

        const limite = new Date(item.inicio);
        limite.setHours(HORA_FIM, 0, 0, 0);

        return (
          fim <= limite &&
          fim <= somarMinutos(agora, 7 * 24 * 60)
        );
      });

      if (!horario) {
        continue;
      }

      const resultado = await repository.atualizarHorario(
        estudo.id,
        usuarioId,
        horario.inicio,
        somarMinutos(horario.inicio, duracao)
      );

      if (resultado.count > 0) {
        reagendados.push(estudo.id);
      }
    }

    return {
      quantidade: reagendados.length,
      estudos: reagendados,
    };
  }
}
