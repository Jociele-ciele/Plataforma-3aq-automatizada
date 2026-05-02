import { Router } from "express";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  const jobs = await prisma.job.findMany({
    where: { isOpen: true },
    orderBy: { createdAt: "desc" },
    include: { challenges: { select: { id: true, title: true } } },
  });
  res.json(jobs);
});

router.get("/admin/all", authMiddleware([Role.RECRUITER]), async (req, res) => {
  const jobs = await prisma.job.findMany({
    where: { recruiterId: req.auth!.userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { applications: true } },
    },
  });
  res.json(jobs);
});

router.get("/:id", async (req, res) => {
  const job = await prisma.job.findUnique({
    where: { id: req.params.id },
    include: {
      challenges: true,
    },
  });
  if (!job) {
    res.status(404).json({ error: "Vaga não encontrada" });
    return;
  }
  res.json(job);
});

const createJobSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  stack: z.array(z.string()).default([]),
  criteria: z.record(z.unknown()).optional(),
});

router.post("/", authMiddleware([Role.RECRUITER]), async (req, res) => {
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  const job = await prisma.job.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      stack: parsed.data.stack,
      criteria: (parsed.data.criteria ??
        { weights: { cvKeywords: 0.2, github: 0.2, technicalTest: 0.6 } }) as Prisma.InputJsonValue,
      recruiterId: req.auth!.userId,
    },
  });
  res.status(201).json(job);
});

export default router;
