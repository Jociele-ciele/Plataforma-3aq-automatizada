import type { Request, Response } from "express";
import { Router } from "express";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const candidaturaSchema = z.object({
  vaga_id: z.string().uuid(),
});

router.post("/", authMiddleware([Role.CANDIDATO]), async (req, res) => {
  const parsed = candidaturaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "vaga_id inválido" });
  }

  const profile = await prisma.perfis_candidatos.findUnique({
    where: { usuario_id: req.auth!.userId },
  });

  if (!profile) {
    return res.status(400).json({
      error: "Perfil de candidato não encontrado",
    });
  }

  const vaga = await prisma.vagas.findUnique({
    where: { id: parsed.data.vaga_id },
  });

  if (!vaga) {
    return res.status(404).json({ error: "Vaga não encontrada" });
  }

  if (!vaga.aberta) {
    return res.status(404).json({ error: "Vaga indisponível" });
  }

  try {
    const candidatura = await prisma.candidaturas.create({
      data: {
        vaga_id: vaga.id,
        candidato_id: profile.id,
        status: "ENVIADO",
      },
    });

    return res.status(201).json(candidatura);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return res.status(409).json({
        error: "Já se candidatou a esta vaga",
      });
    }
    throw e;
  }
});

async function listarMinhas(req: Request, res: Response) {
  const profile = await prisma.perfis_candidatos.findUnique({
    where: { usuario_id: req.auth!.userId },
  });

  if (!profile) {
    return res.json([]);
  }

  const candidaturas = await prisma.candidaturas.findMany({
    where: { candidato_id: profile.id },
    include: {
      vaga: {
        include: {
          desafios: {
            select: {
              id: true,
              titulo: true,
              descricao: true,
              codigo_inicial: true,
            },
          },
        },
      },
      submissoes: {
        orderBy: { criado_em: "desc" },
        take: 5,
      },
    },
    orderBy: { candidatura_em: "desc" },
  });

  return res.json(candidaturas);
}

router.get(
  "/minhas",
  authMiddleware([Role.CANDIDATO]),
  listarMinhas,
);

/** @deprecated Use GET /candidaturas/minhas */
router.get("/mine", authMiddleware([Role.CANDIDATO]), listarMinhas);

router.get(
  "/pipeline",
  authMiddleware([Role.RECRUTADOR]),
  async (req, res) => {
    const vagas = await prisma.vagas.findMany({
      where: { recrutador_id: req.auth!.userId },
      select: { id: true },
    });

    if (vagas.length === 0) {
      return res.json([]);
    }

    const candidaturas = await prisma.candidaturas.findMany({
      where: { vaga_id: { in: vagas.map((v) => v.id) } },
      include: {
        vaga: { select: { id: true, titulo: true } },
        candidato: {
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                github_login: true,
              },
            },
          },
        },
        submissoes: true,
      },
      orderBy: { candidatura_em: "desc" },
    });

    const ranking = candidaturas.map((c) => {
      const notaTeste =
        c.submissoes.length > 0
          ? Math.max(...c.submissoes.map((s) => s.percentual_nota))
          : 0;

      const notaTecnica = c.candidato.nota_tecnica ?? 0;
      const notaCompatibilidade = c.candidato.nota_compatibilidade ?? 0;

      const analiseGithub = c.candidato.analise_github_json;
      let notaGithub = 0;
      if (typeof analiseGithub === "object" && analiseGithub !== null) {
        const json = analiseGithub as Record<string, unknown>;
        notaGithub = Number(
          json.pontuacao_portfolio ?? json.portfolioScore ?? 0,
        );
      }

      const pontuacao_ranking =
        Math.round(
          (notaTeste * 0.6 +
            notaTecnica * 0.2 +
            Math.max(notaCompatibilidade, notaGithub) * 0.2) *
            100,
        ) / 100;

      return { ...c, pontuacao_ranking };
    });

    ranking.sort((a, b) => b.pontuacao_ranking - a.pontuacao_ranking);

    return res.json(ranking);
  },
);

export default router;
