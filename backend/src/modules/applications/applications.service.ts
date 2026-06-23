import axios from "axios";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError, NotFoundError } from "../../utils/errors";
import { githubService } from "../github/github.service";

async function analisarCurriculoComVaga(
  textoExtraido: string,
  vaga: { titulo: string; descricao: string; tecnologias: string[] }
) {
  try {
    const { data } = await axios.post(`${env.AI_SERVICE_URL}/triagem`, {
      texto: textoExtraido,
      tecnologias: vaga.tecnologias,
      tituloVaga: vaga.titulo,
      descricao: vaga.descricao,
    });
    return {
      scoreCurriculo: Math.round(data.scoreAderencia),
      resumoIA: data.resumo as string,
    };
  } catch (e) {
    console.warn("[IA] indisponível, usando fallback simples:", (e as Error).message);
    return {
      scoreCurriculo: fallbackScore(textoExtraido, vaga.tecnologias),
      resumoIA: "Análise simplificada (serviço de IA indisponível)",
    };
  }
}

export const applicationsService = {
  async apply(candidatoId: string, vagaId: string) {
    const vaga = await prisma.job.findUnique({ where: { id: vagaId } });
    if (!vaga) throw new NotFoundError("Vaga não encontrada");
    if (vaga.status !== "ABERTA") throw new AppError("Esta vaga não está mais aberta", 400);

    const jaInscrito = await prisma.application.findUnique({
      where: { candidatoId_vagaId: { candidatoId, vagaId } },
    });
    if (jaInscrito) throw new AppError("Você já se inscreveu nesta vaga", 409);

    // Currículo mais recente
    const resume = await prisma.resume.findFirst({
      where: { candidatoId },
      orderBy: { createdAt: "desc" },
    });

    let scoreCurriculo = 0;
    let resumoIA: string | null = null;
    if (resume?.textoExtraido) {
      const analise = await analisarCurriculoComVaga(resume.textoExtraido, vaga);
      scoreCurriculo = analise.scoreCurriculo;
      resumoIA = analise.resumoIA;
    }

    // GitHub
    const user = await prisma.user.findUnique({ where: { id: candidatoId } });
    let scoreGithub = 0;
    if (user?.github) {
      try {
        const analise = await githubService.analisarUsuario(candidatoId, user.github);
        scoreGithub = analise.score;
      } catch (e) {
        console.warn("[GitHub] erro ao analisar:", (e as Error).message);
      }
    }

    return prisma.application.create({
      data: {
        candidatoId,
        vagaId,
        scoreCurriculo,
        scoreGithub,
        scoreDesafios: 0,
        notaFinal: Math.round(scoreCurriculo * 0.3 + scoreGithub * 0.2),
        resumoIA,
        status: "EM_ANALISE",
      },
      include: { vaga: true },
    });
  },

  async listMine(candidatoId: string) {
    return prisma.application.findMany({
      where: { candidatoId },
      include: {
        vaga: { select: { id: true, titulo: true, tecnologias: true, status: true } },
        submissions: { include: { challenge: { select: { tipo: true, peso: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async listByJob(vagaId: string, recrutadorId: string) {
    const vaga = await prisma.job.findUnique({ where: { id: vagaId } });
    if (!vaga) throw new NotFoundError("Vaga não encontrada");
    if (vaga.recrutadorId !== recrutadorId) throw new AppError("Sem permissão", 403);

    return prisma.application.findMany({
      where: { vagaId },
      include: {
        candidato: {
          select: {
            id: true,
            nome: true,
            email: true,
            github: true,
            githubAnalysis: true,
            avatar: true,
          },
        },
        submissions: { include: { challenge: { select: { tipo: true, peso: true } } } },
      },
      orderBy: { notaFinal: "desc" },
    });
  },

  async reanalisarCurriculoDasInscricoes(candidatoId: string) {
    const resume = await prisma.resume.findFirst({
      where: { candidatoId },
      orderBy: { createdAt: "desc" },
    });
    if (!resume?.textoExtraido) return;

    const inscricoes = await prisma.application.findMany({
      where: { candidatoId },
      include: { vaga: true, submissions: { include: { challenge: { select: { peso: true } } } } },
    });

    for (const app of inscricoes) {
      const analise = await analisarCurriculoComVaga(resume.textoExtraido, app.vaga);
      const totalPesos =
        app.submissions.reduce((acc, s) => acc + (s.challenge.peso ?? 1), 0) || 1;
      const somaPond = app.submissions.reduce(
        (acc, s) => acc + s.nota * (s.challenge.peso ?? 1),
        0
      );
      const scoreDesafios = somaPond / totalPesos;
      const notaFinal = Math.round(
        analise.scoreCurriculo * 0.3 + app.scoreGithub * 0.2 + scoreDesafios * 0.5
      );

      await prisma.application.update({
        where: { id: app.id },
        data: {
          scoreCurriculo: analise.scoreCurriculo,
          resumoIA: analise.resumoIA,
          scoreDesafios,
          notaFinal,
        },
      });
    }
  },

  async atualizarNotaFinal(applicationId: string) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        vaga: true,
        submissions: { include: { challenge: { select: { peso: true } } } },
      },
    });
    if (!app) throw new NotFoundError();

    let scoreCurriculo = app.scoreCurriculo;
    let resumoIA = app.resumoIA;

    const resume = await prisma.resume.findFirst({
      where: { candidatoId: app.candidatoId },
      orderBy: { createdAt: "desc" },
    });
    if (resume?.textoExtraido) {
      const analise = await analisarCurriculoComVaga(resume.textoExtraido, app.vaga);
      scoreCurriculo = analise.scoreCurriculo;
      resumoIA = analise.resumoIA;
    }

    const totalPesos = app.submissions.reduce((acc, s) => acc + (s.challenge.peso ?? 1), 0) || 1;
    const somaPond = app.submissions.reduce(
      (acc, s) => acc + s.nota * (s.challenge.peso ?? 1),
      0
    );
    const scoreDesafios = somaPond / totalPesos;

    const notaFinal = Math.round(
      scoreCurriculo * 0.3 + app.scoreGithub * 0.2 + scoreDesafios * 0.5
    );

    return prisma.application.update({
      where: { id: applicationId },
      data: { scoreCurriculo, resumoIA, scoreDesafios, notaFinal },
    });
  },

  async setStatus(
    applicationId: string,
    recrutadorId: string,
    status: "APROVADO" | "REPROVADO" | "EM_ANALISE",
    feedback?: string
  ) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { vaga: true },
    });
    if (!app) throw new NotFoundError();
    if (app.vaga.recrutadorId !== recrutadorId) throw new AppError("Sem permissão", 403);
    return prisma.application.update({
      where: { id: applicationId },
      data: { status, feedback },
    });
  },

  async getById(applicationId: string, userId: string, role: string) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        vaga: { include: { recrutador: { select: { id: true, nome: true } } } },
        candidato: {
          select: {
            id: true,
            nome: true,
            email: true,
            github: true,
            githubAnalysis: true,
            resumes: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                nomeArquivo: true,
                textoExtraido: true,
                createdAt: true,
              },
            },
          },
        },
        submissions: { include: { challenge: true } },
      },
    });
    if (!app) throw new NotFoundError();

    const podeVer =
      (role === "CANDIDATO" && app.candidatoId === userId) ||
      (role === "RECRUTADOR" && app.vaga.recrutadorId === userId);
    if (!podeVer) throw new AppError("Sem permissão", 403);
    return app;
  },
};

// fallback simples caso o serviço de IA esteja fora do ar
function fallbackScore(texto: string, tecnologias: string[]): number {
  const textoLower = texto.toLowerCase();
  let encontradas = 0;
  for (const tec of tecnologias) {
    if (textoLower.includes(tec.toLowerCase())) encontradas++;
  }
  return Math.round((encontradas / Math.max(tecnologias.length, 1)) * 100);
}