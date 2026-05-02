import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const applySchema = z.object({ jobId: z.string().uuid() });

router.post("/", authMiddleware([Role.CANDIDATE]), async (req, res) => {
  const parsed = applySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "jobId inválido" });
    return;
  }
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: req.auth!.userId },
  });
  if (!profile) {
    res.status(400).json({ error: "Perfil de candidato em falta" });
    return;
  }
  const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } });
  if (!job?.isOpen) {
    res.status(404).json({ error: "Vaga indisponível" });
    return;
  }
  try {
    const app = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: profile.id,
        status: "SUBMITTED",
      },
    });
    res.status(201).json(app);
  } catch {
    res.status(409).json({ error: "Já candidatou-se a esta vaga" });
  }
});

router.get("/mine", authMiddleware([Role.CANDIDATE]), async (req, res) => {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: req.auth!.userId },
  });
  if (!profile) {
    res.json([]);
    return;
  }
  const apps = await prisma.application.findMany({
    where: { candidateId: profile.id },
    include: {
      job: { include: { challenges: { select: { id: true, title: true } } } },
      submissions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
    orderBy: { appliedAt: "desc" },
  });
  res.json(apps);
});

router.get("/pipeline", authMiddleware([Role.RECRUITER]), async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: { recruiterId: req.auth!.userId },
    select: { id: true },
  });
  const jobIds = jobs.map((j) => j.id);
  const apps = await prisma.application.findMany({
    where: { jobId: { in: jobIds } },
    include: {
      job: { select: { id: true, title: true } },
      candidate: {
        include: {
          user: {
            select: { id: true, name: true, email: true, githubLogin: true },
          },
        },
      },
      submissions: true,
    },
    orderBy: { appliedAt: "desc" },
  });

  const ranked = apps.map((a) => {
    const testScore =
      a.submissions.length > 0
        ? Math.max(...a.submissions.map((s) => s.scorePercent))
        : 0;
    const tech = a.candidate.technicalScore ?? 0;
    const fit = a.candidate.fitScore ?? 0;
    const gh =
      typeof a.candidate.githubAnalysisJson === "object" &&
      a.candidate.githubAnalysisJson !== null &&
      "portfolioScore" in a.candidate.githubAnalysisJson
        ? Number(
            (a.candidate.githubAnalysisJson as { portfolioScore?: number })
              .portfolioScore ?? 0,
          )
        : 0;
    const total = testScore * 0.6 + tech * 0.2 + Math.max(fit, gh) * 0.2;
    return { ...a, rankingScore: Math.round(total * 100) / 100 };
  });
  ranked.sort((x, y) => y.rankingScore - x.rankingScore);
  res.json(ranked);
});

export default router;
