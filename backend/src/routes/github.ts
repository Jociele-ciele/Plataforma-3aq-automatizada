import type { Request, Response } from "express";
import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { analisarGithubPublico } from "../services/githubService.js";

const router = Router();

async function analisarHandler(req: Request, res: Response) {
  const schema = z.object({ login: z.string().min(1).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const user = await prisma.users.findUnique({
    where: { id: req.auth!.userId },
    select: { github_login: true },
  });

  const login = parsed.data.login?.trim() || user?.github_login;
  if (!login) {
    return res.status(400).json({
      error: "Informe o github_login no perfil ou na requisição",
    });
  }

  try {
    const analise = await analisarGithubPublico(login);

    const profile = await prisma.perfis_candidatos.findUnique({
      where: { usuario_id: req.auth!.userId },
    });

    if (profile) {
      await prisma.perfis_candidatos.update({
        where: { id: profile.id },
        data: { analise_github_json: analise as object },
      });
    }

    await prisma.users.update({
      where: { id: req.auth!.userId },
      data: { github_login: login },
    });

    return res.json(analise);
  } catch (e) {
    return res.status(502).json({
      error: e instanceof Error ? e.message : "Falha GitHub",
    });
  }
}

router.post(
  "/analisar",
  authMiddleware([Role.CANDIDATO]),
  analisarHandler,
);

/** @deprecated Use POST /github/analisar */
router.post(
  "/analyze",
  authMiddleware([Role.CANDIDATO]),
  analisarHandler,
);

export default router;
