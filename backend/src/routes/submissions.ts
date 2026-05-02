import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { runJavascriptChallenge } from "../services/codeRunner.js";

const router = Router();

const submitSchema = z.object({
  applicationId: z.string().uuid(),
  challengeId: z.string().uuid(),
  code: z.string().min(5),
});

router.post("/", authMiddleware([Role.CANDIDATE]), async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Payload inválido", details: parsed.error.flatten() });
    return;
  }
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: req.auth!.userId },
  });
  if (!profile) {
    res.status(403).json({ error: "Sem perfil" });
    return;
  }
  const application = await prisma.application.findFirst({
    where: {
      id: parsed.data.applicationId,
      candidateId: profile.id,
    },
    include: { job: true },
  });
  if (!application) {
    res.status(404).json({ error: "Candidatura não encontrada" });
    return;
  }
  const challenge = await prisma.challenge.findFirst({
    where: { id: parsed.data.challengeId, jobId: application.jobId },
  });
  if (!challenge) {
    res.status(404).json({ error: "Desafio inválido para esta vaga" });
    return;
  }
  if (challenge.language !== "javascript") {
    res.status(400).json({ error: "Apenas JavaScript suportado neste protótipo" });
    return;
  }
  const testCases = challenge.testCases as { input: unknown; expected: unknown }[];
  const run = runJavascriptChallenge(parsed.data.code, testCases, challenge.timeLimitMs);
  const feedback = run.details.join("\n");

  const submission = await prisma.submission.create({
    data: {
      applicationId: application.id,
      challengeId: challenge.id,
      code: parsed.data.code,
      passedTests: run.passed,
      totalTests: run.total,
      feedback,
      scorePercent: run.scorePercent,
    },
  });

  await prisma.application.update({
    where: { id: application.id },
    data: {
      status: run.scorePercent >= 70 ? "REVIEWED" : "TESTING",
    },
  });

  res.status(201).json({
    passedTests: submission.passedTests,
    totalTests: submission.totalTests,
    scorePercent: submission.scorePercent,
    feedback: submission.feedback,
    message:
      "Resultado disponível imediatamente (RN03). Em produção, reexecute em ambiente isolado.",
  });
});

export default router;
