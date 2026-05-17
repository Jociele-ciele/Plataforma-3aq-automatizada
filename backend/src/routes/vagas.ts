import { Router } from "express";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const criarVagaSchema = z.object({
  titulo: z.string().min(2),
  descricao: z.string().min(10),
  tecnologias: z.array(z.string()).default([]),
  criterios: z.record(z.unknown()).optional(),
});

const criteriosPadrao: Prisma.InputJsonValue = {
  pesos: {
    palavras_chave_cv: 0.2,
    github: 0.2,
    teste_tecnico: 0.6,
  },
};

router.get("/", async (_req, res) => {
  const vagas = await prisma.vagas.findMany({
    where: { aberta: true },
    orderBy: { criado_em: "desc" },
    include: {
      desafios: {
        select: { id: true, titulo: true },
      },
    },
  });

  return res.json(vagas);
});

router.get(
  "/admin/todas",
  authMiddleware([Role.RECRUTADOR]),
  async (req, res) => {
    const vagas = await prisma.vagas.findMany({
      where: { recrutador_id: req.auth!.userId },
      orderBy: { criado_em: "desc" },
      include: {
        _count: { select: { candidaturas: true } },
      },
    });

    return res.json(vagas);
  },
);

/** @deprecated Use GET /vagas/admin/todas */
router.get(
  "/admin/all",
  authMiddleware([Role.RECRUTADOR]),
  async (req, res) => {
    const vagas = await prisma.vagas.findMany({
      where: { recrutador_id: req.auth!.userId },
      orderBy: { criado_em: "desc" },
      include: {
        _count: { select: { candidaturas: true } },
      },
    });

    return res.json(vagas);
  },
);

router.get("/:id", async (req, res) => {
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "ID de vaga inválido" });
  }

  const vaga = await prisma.vagas.findUnique({
    where: { id: parsed.data.id },
    include: { desafios: true },
  });

  if (!vaga) {
    return res.status(404).json({ error: "Vaga não encontrada" });
  }

  return res.json(vaga);
});

router.post(
  "/",
  authMiddleware([Role.RECRUTADOR]),
  async (req, res) => {
    const parsed = criarVagaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: parsed.error.flatten(),
      });
    }

    const vaga = await prisma.vagas.create({
      data: {
        titulo: parsed.data.titulo,
        descricao: parsed.data.descricao,
        tecnologias: parsed.data.tecnologias,
        criterios: (parsed.data.criterios ?? criteriosPadrao) as Prisma.InputJsonValue,
        recrutador_id: req.auth!.userId,
      },
    });

    return res.status(201).json(vaga);
  },
);

export default router;
