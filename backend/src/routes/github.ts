import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { analyzeGithubPublic } from "../services/githubService.js";

const router = Router();

router.post("/analyze", authMiddleware([Role.CANDIDATE]), async (req, res) => {
  const schema = z.object({ login: z.string().min(1).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
  const login = parsed.data.login?.trim() || user?.githubLogin;
  if (!login) {
    res.status(400).json({ error: "Indique github login no perfil ou no pedido" });
    return;
  }
  try {
    const analysis = await analyzeGithubPublic(login);
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.auth!.userId },
    });
    if (profile) {
      await prisma.candidateProfile.update({
        where: { id: profile.id },
        data: { githubAnalysisJson: analysis as object },
      });
    }
    await prisma.user.update({
      where: { id: req.auth!.userId },
      data: { githubLogin: login },
    });
    res.json(analysis);
  } catch (e) {
    res.status(502).json({
      error: e instanceof Error ? e.message : "Falha GitHub",
    });
  }
});

export default router;
