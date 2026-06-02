import { prisma } from "../../config/prisma";

export const rankingService = {
  async byJob(vagaId: string) {
    const apps = await prisma.application.findMany({
      where: { vagaId },
      include: {
        candidato: {
          select: { id: true, nome: true, avatar: true, github: true },
        },
      },
      orderBy: [{ notaFinal: "desc" }, { createdAt: "asc" }],
    });

    return apps.map((a, i) => ({
      posicao: i + 1,
      applicationId: a.id,
      candidato: a.candidato,
      notaFinal: a.notaFinal,
      scoreCurriculo: a.scoreCurriculo,
      scoreGithub: a.scoreGithub,
      scoreDesafios: a.scoreDesafios,
      status: a.status,
      medalha: i === 0 ? "ouro" : i === 1 ? "prata" : i === 2 ? "bronze" : null,
    }));
  },

  async dashboardRecrutador(recrutadorId: string) {
    const [total, abertas, encerradas, totalCandidatos, top5] = await Promise.all([
      prisma.job.count({ where: { recrutadorId } }),
      prisma.job.count({ where: { recrutadorId, status: "ABERTA" } }),
      prisma.job.count({ where: { recrutadorId, status: "ENCERRADA" } }),
      prisma.application.count({ where: { vaga: { recrutadorId } } }),
      prisma.application.findMany({
        where: { vaga: { recrutadorId } },
        orderBy: { notaFinal: "desc" },
        take: 5,
        include: {
          candidato: { select: { id: true, nome: true, avatar: true } },
          vaga: { select: { id: true, titulo: true } },
        },
      }),
    ]);

    const media = await prisma.application.aggregate({
      where: { vaga: { recrutadorId } },
      _avg: { notaFinal: true },
    });

    // distribuição das vagas pelo status (para gráfico)
    const distribStatus = [
      { status: "ABERTA", total: abertas },
      { status: "ENCERRADA", total: encerradas },
      { status: "RASCUNHO", total: total - abertas - encerradas },
    ];

    // candidatos por mês (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 5);
    seisMesesAtras.setDate(1);

    const apps = await prisma.application.findMany({
      where: { vaga: { recrutadorId }, createdAt: { gte: seisMesesAtras } },
      select: { createdAt: true },
    });
    const porMes: Record<string, number> = {};
    for (const a of apps) {
      const k = `${a.createdAt.getFullYear()}-${String(a.createdAt.getMonth() + 1).padStart(2, "0")}`;
      porMes[k] = (porMes[k] ?? 0) + 1;
    }

    // Tendências (% comparando últimos 30 dias com os 30 anteriores)
    const agora = new Date();
    const trintaDias = new Date(agora.getTime() - 30 * 86_400_000);
    const sessentaDias = new Date(agora.getTime() - 60 * 86_400_000);

    const [
      vagasUltimos30,
      vagasAnteriores30,
      candidatosUltimos30,
      candidatosAnteriores30,
      mediaUltimos30,
      mediaAnteriores30,
    ] = await Promise.all([
      prisma.job.count({
        where: { recrutadorId, createdAt: { gte: trintaDias } },
      }),
      prisma.job.count({
        where: {
          recrutadorId,
          createdAt: { gte: sessentaDias, lt: trintaDias },
        },
      }),
      prisma.application.count({
        where: { vaga: { recrutadorId }, createdAt: { gte: trintaDias } },
      }),
      prisma.application.count({
        where: {
          vaga: { recrutadorId },
          createdAt: { gte: sessentaDias, lt: trintaDias },
        },
      }),
      prisma.application.aggregate({
        where: { vaga: { recrutadorId }, createdAt: { gte: trintaDias } },
        _avg: { notaFinal: true },
      }),
      prisma.application.aggregate({
        where: {
          vaga: { recrutadorId },
          createdAt: { gte: sessentaDias, lt: trintaDias },
        },
        _avg: { notaFinal: true },
      }),
    ]);

    const calcDelta = (atual: number, anterior: number) => {
      if (anterior === 0) return atual > 0 ? 100 : 0;
      return Math.round(((atual - anterior) / anterior) * 100);
    };

    const tendencias = {
      vagas: calcDelta(vagasUltimos30, vagasAnteriores30),
      abertas: calcDelta(abertas, Math.max(abertas - vagasUltimos30, 0)),
      candidatos: calcDelta(candidatosUltimos30, candidatosAnteriores30),
      media: calcDelta(
        Math.round(mediaUltimos30._avg.notaFinal ?? 0),
        Math.round(mediaAnteriores30._avg.notaFinal ?? 0)
      ),
    };

    // Atividades recentes (últimas 8 inscrições)
    const atividadesRecentes = await prisma.application.findMany({
      where: { vaga: { recrutadorId } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        createdAt: true,
        status: true,
        notaFinal: true,
        candidato: { select: { id: true, nome: true, avatar: true } },
        vaga: { select: { id: true, titulo: true } },
      },
    });

    return {
      totalVagas: total,
      vagasAbertas: abertas,
      vagasEncerradas: encerradas,
      totalCandidatos,
      mediaNotas: Math.round(media._avg.notaFinal ?? 0),
      tendencias,
      top5,
      distribStatus,
      atividadesRecentes,
      porMes: Object.entries(porMes)
        .sort()
        .map(([mes, total]) => ({ mes, total })),
    };
  },

  async dashboardCandidato(candidatoId: string) {
    const [vagasAbertas, minhasInscricoes, gh, submissoes] = await Promise.all([
      prisma.job.count({ where: { status: "ABERTA" } }),
      prisma.application.findMany({
        where: { candidatoId },
        include: {
          vaga: { select: { id: true, titulo: true, tecnologias: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.githubAnalysis.findUnique({ where: { candidatoId } }),
      prisma.submission.findMany({
        where: { candidatoId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          challenge: {
            select: {
              id: true,
              tipo: true,
              enunciado: true,
              peso: true,
              vaga: { select: { id: true, titulo: true } },
            },
          },
        },
      }),
    ]);

    const aprovadas = minhasInscricoes.filter((i) => i.status === "APROVADO").length;
    const reprovadas = minhasInscricoes.filter((i) => i.status === "REPROVADO").length;
    const emAnalise = minhasInscricoes.filter((i) => i.status === "EM_ANALISE").length;

    // Agrupa as submissões pelo desafio, mantendo apenas a melhor nota
    const melhorPorDesafio = new Map<
      string,
      (typeof submissoes)[number]
    >();
    for (const s of submissoes) {
      const atual = melhorPorDesafio.get(s.challengeId);
      if (!atual || s.nota > atual.nota) melhorPorDesafio.set(s.challengeId, s);
    }
    const desafiosResolvidos = Array.from(melhorPorDesafio.values()).map((s) => ({
      submissionId: s.id,
      challengeId: s.challengeId,
      tipo: s.challenge.tipo,
      enunciado:
        s.challenge.enunciado.length > 80
          ? `${s.challenge.enunciado.slice(0, 80)}…`
          : s.challenge.enunciado,
      peso: s.challenge.peso,
      vaga: s.challenge.vaga,
      nota: Math.round(s.nota),
      createdAt: s.createdAt,
    }));

    const mediaDesafios = desafiosResolvidos.length
      ? Math.round(
          desafiosResolvidos.reduce((acc, d) => acc + d.nota, 0) /
            desafiosResolvidos.length
        )
      : 0;

    return {
      vagasAbertas,
      totalInscricoes: minhasInscricoes.length,
      aprovadas,
      reprovadas,
      emAnalise,
      mediaNotas: Math.round(
        minhasInscricoes.reduce((acc, i) => acc + i.notaFinal, 0) /
          (minhasInscricoes.length || 1)
      ),
      githubScore: gh?.score ?? 0,
      desafiosResolvidos,
      mediaDesafios,
      historico: minhasInscricoes.slice(0, 10),
    };
  },
};
