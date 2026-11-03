import { Request, Response } from "express";
import { TipoCompromisso } from "@prisma/client";
import repository, {
  ProvaTrabalhoDados,
} from "../repositories/provaTrabalhoRepository";

const TIPOS_VALIDOS: TipoCompromisso[] = [
  TipoCompromisso.PROVA,
  TipoCompromisso.TRABALHO,
];

// Duração padrão de uma prova/trabalho quando só o horário de início é informado.
const DURACAO_PADRAO_MINUTOS = 60;

function obterUsuarioId(req: Request): number | null {
  const usuarioId = Number(req.session.usuario?.id);
  return Number.isInteger(usuarioId) && usuarioId > 0 ? usuarioId : null;
}

// Converte "HH:MM" em um Date usado pela coluna TIME do banco.
function horarioParaDate(horario: string): Date | null {
  if (!/^\d{2}:\d{2}$/.test(horario)) {
    return null;
  }

  const data = new Date(`1970-01-01T${horario}:00.000Z`);
  return Number.isNaN(data.getTime()) ? null : data;
}

function converterData(data: string): Date | null {
  const resultado = new Date(`${data}T12:00:00`);
  return Number.isNaN(resultado.getTime()) ? null : resultado;
}

class ProvaTrabalhoController {
  async listar(req: Request, res: Response) {
    const usuarioId = obterUsuarioId(req);

    if (!usuarioId) {
      return res.status(401).json({ mensagem: "Faça login para continuar." });
    }

    try {
      const dados = await repository.listar(usuarioId);
      return res.json(dados);
    } catch {
      return res.status(500).json({
        mensagem: "Erro ao listar compromissos.",
      });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    const usuarioId = obterUsuarioId(req);

    if (!usuarioId) {
      return res.status(401).json({ mensagem: "Faça login para continuar." });
    }

    try {
      const id = Number(req.params.id);
      const dados = await repository.buscarPorId(id, usuarioId);

      if (!dados) {
        return res.status(404).json({
          mensagem: "Compromisso não encontrado.",
        });
      }

      return res.json(dados);
    } catch {
      return res.status(500).json({
        mensagem: "Erro ao buscar compromisso.",
      });
    }
  }

  async criar(req: Request, res: Response) {
    const usuarioId = obterUsuarioId(req);

    if (!usuarioId) {
      return res.status(401).json({ mensagem: "Faça login para continuar." });
    }

    try {
      const { titulo, disciplina, descricao, data, horario, tipo } =
        req.body;

      if (!titulo || !disciplina || !data || !horario || !tipo) {
        return res.status(400).json({
          mensagem: "Preencha título, disciplina, data, horário e tipo.",
        });
      }

      if (!TIPOS_VALIDOS.includes(tipo)) {
        return res.status(400).json({
          mensagem: "Tipo de compromisso inválido.",
        });
      }

      const dataConvertida = converterData(data);
      const horarioInicio = horarioParaDate(horario);

      if (!dataConvertida || !horarioInicio) {
        return res.status(400).json({
          mensagem: "Data ou horário inválido.",
        });
      }

      const novo = await repository.criar(usuarioId, {
        titulo,
        disciplina,
        descricao: descricao || null,
        data: dataConvertida,
        horarioInicio,
        horarioFim: new Date(
          horarioInicio.getTime() + DURACAO_PADRAO_MINUTOS * 60_000
        ),
        tipo,
      });

      return res.status(201).json(novo);
    } catch {
      return res.status(500).json({
        mensagem: "Erro ao cadastrar compromisso.",
      });
    }
  }

  async atualizar(req: Request, res: Response) {
    const usuarioId = obterUsuarioId(req);

    if (!usuarioId) {
      return res.status(401).json({ mensagem: "Faça login para continuar." });
    }

    try {
      const id = Number(req.params.id);
      const existente = await repository.buscarPorId(id, usuarioId);

      if (!existente) {
        return res.status(404).json({
          mensagem: "Compromisso não encontrado.",
        });
      }

      const { titulo, disciplina, descricao, data, horario, tipo } =
        req.body;
      const dados: Partial<ProvaTrabalhoDados> = {};

      if (titulo !== undefined) dados.titulo = titulo;
      if (disciplina !== undefined) dados.disciplina = disciplina;
      if (descricao !== undefined) dados.descricao = descricao || null;

      if (tipo !== undefined) {
        if (!TIPOS_VALIDOS.includes(tipo)) {
          return res.status(400).json({
            mensagem: "Tipo de compromisso inválido.",
          });
        }
        dados.tipo = tipo;
      }

      if (data !== undefined) {
        const dataConvertida = converterData(data);
        if (!dataConvertida) {
          return res.status(400).json({ mensagem: "Data inválida." });
        }
        dados.data = dataConvertida;
      }

      if (horario !== undefined) {
        const horarioInicio = horarioParaDate(horario);
        if (!horarioInicio) {
          return res.status(400).json({ mensagem: "Horário inválido." });
        }
        dados.horarioInicio = horarioInicio;
        dados.horarioFim = new Date(
          horarioInicio.getTime() + DURACAO_PADRAO_MINUTOS * 60_000
        );
      }

      await repository.atualizar(id, usuarioId, dados);
      const atualizado = await repository.buscarPorId(id, usuarioId);
      return res.json(atualizado);
    } catch {
      return res.status(500).json({
        mensagem: "Erro ao atualizar compromisso.",
      });
    }
  }

  async excluir(req: Request, res: Response) {
    const usuarioId = obterUsuarioId(req);

    if (!usuarioId) {
      return res.status(401).json({ mensagem: "Faça login para continuar." });
    }

    try {
      const id = Number(req.params.id);
      const resultado = await repository.excluir(id, usuarioId);

      if (resultado.count === 0) {
        return res.status(404).json({
          mensagem: "Compromisso não encontrado.",
        });
      }

      return res.json({
        mensagem: "Compromisso excluído com sucesso.",
      });
    } catch {
      return res.status(500).json({
        mensagem: "Erro ao excluir compromisso.",
      });
    }
  }
}

export default new ProvaTrabalhoController();
