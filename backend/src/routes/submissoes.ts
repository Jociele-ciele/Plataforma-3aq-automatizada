import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { executarDesafioJavascript } from "../services/codeRunner.js";

const router = Router();

const submitSchema = z.object({
  candidatura_id: z.string().uuid(),
  desafio_id: z.string().uuid(),
  codigo: z.string().min(5),
});

router.post(
  "/",
  authMiddleware([Role.CANDIDATO]),
  async (req, res) => {
    const parsed = submitSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Payload inválido",
        details: parsed.error.flatten(),
      });
    }

    const profile = await prisma.perfis_candidatos.findUnique({
      where: { usuario_id: req.auth!.userId },
    });

    if (!profile) {
      return res.status(403).json({ error: "Perfil não encontrado" });
    }

    const candidatura = await prisma.candidaturas.findFirst({
      where: {
        id: parsed.data.candidatura_id,
        candidato_id: profile.id,
      },
      include: { vaga: true },
    });

    if (!candidatura) {
      return res.status(404).json({
        error: "Candidatura não encontrada",
      });
    }

    const desafio = await prisma.desafios.findFirst({
      where: {
        id: parsed.data.desafio_id,
        vaga_id: candidatura.vaga_id,
      },
    });

    if (!desafio) {
      return res.status(404).json({
        error: "Desafio inválido para esta vaga",
      });
    }

    if (desafio.linguagem !== "javascript") {
      return res.status(400).json({
        error: "Apenas JavaScript é suportado neste protótipo",
      });
    }

    const casosTeste = desafio.casos_teste as {
      input: unknown;
      expected: unknown;
    }[];

    const resultado = executarDesafioJavascript(
      parsed.data.codigo,
      casosTeste,
      desafio.limite_tempo_ms,
    );

    const feedback = resultado.detalhes.join("\n");

    const submissao = await prisma.submissoes.create({
      data: {
        candidatura_id: candidatura.id,
        desafio_id: desafio.id,
        codigo: parsed.data.codigo,
        testes_aprovados: resultado.testes_aprovados,
        total_testes: resultado.total_testes,
        feedback,
        percentual_nota: resultado.percentual_nota,
      },
    });

    await prisma.candidaturas.update({
      where: { id: candidatura.id },
      data: {
        status:
          resultado.percentual_nota >= 70 ? "REVISADO" : "EM_TESTE",
      },
    });

    return res.status(201).json({
      testes_aprovados: submissao.testes_aprovados,
      total_testes: submissao.total_testes,
      percentual_nota: submissao.percentual_nota,
      feedback: submissao.feedback,
      message:
        "Resultado disponível imediatamente. Em produção, execute em ambiente isolado.",
    });
  },
);

export default router;
