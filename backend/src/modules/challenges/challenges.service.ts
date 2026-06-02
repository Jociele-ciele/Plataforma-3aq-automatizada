import { prisma } from "../../config/prisma";
import { AppError, NotFoundError } from "../../utils/errors";
import { CreateChallengeDTO, SubmitChallengeDTO } from "./challenges.schema";
import { rodarCodigo, CasoTeste } from "./sandbox";

export const challengesService = {
  async create(recrutadorId: string, data: CreateChallengeDTO) {
    const vaga = await prisma.job.findUnique({
      where: { id: data.vagaId },
      include: { _count: { select: { challenges: true } } },
    });
    if (!vaga) throw new NotFoundError("Vaga não encontrada");
    if (vaga.recrutadorId !== recrutadorId)
      throw new AppError("Esta vaga não é sua", 403);
    if (vaga._count.challenges >= 5) {
      throw new AppError("Cada vaga pode ter no máximo 5 desafios", 400);
    }

    return prisma.challenge.create({
      data: {
        vagaId: data.vagaId,
        tipo: data.tipo,
        enunciado: data.enunciado,
        peso: data.peso,
        alternativas: data.alternativas as never,
        respostaCorreta: data.respostaCorreta ?? null,
        exemplos: data.exemplos as never,
        casosTeste: data.casosTeste as never,
      },
    });
  },

  async listByJob(vagaId: string, paraCandidato: boolean) {
    const challenges = await prisma.challenge.findMany({ where: { vagaId } });
    if (paraCandidato) {
      return challenges.map(({ respostaCorreta, casosTeste, ...rest }) => ({
        ...rest,
        // mostra só os 2 primeiros casos como exemplo
        casosTesteExemplo: Array.isArray(casosTeste) ? casosTeste.slice(0, 2) : [],
      }));
    }
    return challenges;
  },

  async getById(id: string) {
    const c = await prisma.challenge.findUnique({ where: { id } });
    if (!c) throw new NotFoundError("Desafio não encontrado");
    return c;
  },

  async submit(candidatoId: string, challengeId: string, data: SubmitChallengeDTO) {
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new NotFoundError("Desafio não encontrado");

    let nota = 0;
    let detalhes: Record<string, unknown> | null = null;

    if (challenge.tipo === "MULTIPLA_ESCOLHA") {
      if (!data.resposta) throw new AppError("Informe a alternativa marcada", 400);
      nota = data.resposta === challenge.respostaCorreta ? 100 : 0;
      detalhes = {
        marcada: data.resposta,
        correta: challenge.respostaCorreta,
        acertou: nota === 100,
      };
    } else {
      if (!data.codigo) throw new AppError("Envie o código JavaScript", 400);
      const casos = (challenge.casosTeste as unknown as CasoTeste[]) ?? [];
      const resultado = rodarCodigo(data.codigo, casos);
      nota = resultado.nota;
      detalhes = resultado as never;
    }

    return prisma.submission.create({
      data: {
        challengeId,
        candidatoId,
        applicationId: data.applicationId ?? null,
        codigo: data.codigo,
        resposta: data.resposta,
        nota,
        detalhes: detalhes as never,
      },
    });
  },

  async remove(challengeId: string, recrutadorId: string) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { vaga: true },
    });
    if (!challenge) throw new NotFoundError();
    if (challenge.vaga.recrutadorId !== recrutadorId) throw new AppError("Sem permissão", 403);
    await prisma.challenge.delete({ where: { id: challengeId } });
  },
};