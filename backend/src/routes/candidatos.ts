import path from "path";
import type { Request, Response } from "express";
import { Router } from "express";
import { Role } from "@prisma/client";
import multer from "multer";
import { config } from "../config.js";
import { prisma } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { writeEncryptedFile } from "../services/fileCrypto.js";
import { analisarTextoCV } from "../services/aiClient.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/cv",
  authMiddleware([Role.CANDIDATO]),
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) return next(err);
      return void handleUploadCv(req, res);
    });
  },
);

async function handleUploadCv(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({
      error: "Arquivo não enviado (campo file)",
    });
  }

  const profile = await prisma.perfis_candidatos.findUnique({
    where: { usuario_id: req.auth!.userId },
  });

  if (!profile) {
    return res.status(400).json({ error: "Perfil não encontrado" });
  }

  const nomeArquivo = await writeEncryptedFile(
    config.uploadDir,
    req.file.originalname,
    req.file.buffer,
  );

  const isTexto =
    req.file.mimetype === "text/plain" ||
    (req.file.mimetype === "application/octet-stream" &&
      req.file.originalname.toLowerCase().endsWith(".txt"));

  const updateData: {
    caminho_cv: string;
    tipo_mime_cv: string;
    texto_extraido_cv?: string;
  } = {
    caminho_cv: path.join(config.uploadDir, nomeArquivo),
    tipo_mime_cv: req.file.mimetype,
  };

  if (isTexto) {
    updateData.texto_extraido_cv = req.file.buffer.toString("utf8");
  }

  await prisma.perfis_candidatos.update({
    where: { id: profile.id },
    data: updateData,
  });

  return res.json({
    ok: true,
    texto_extraido: isTexto,
    message: isTexto
      ? "Currículo guardado e texto extraído."
      : "Currículo guardado. Envie um ficheiro .txt para triagem automática.",
  });
}

async function analisarCvHandler(req: Request, res: Response) {
  const profile = await prisma.perfis_candidatos.findUnique({
    where: { usuario_id: req.auth!.userId },
  });

  if (!profile?.texto_extraido_cv?.trim()) {
    return res.status(400).json({
      error:
        "Envie um currículo em formato .txt para extrair o texto antes da análise.",
    });
  }

  const candidaturas = await prisma.candidaturas.findMany({
    where: { candidato_id: profile.id },
    include: { vaga: true },
    orderBy: { candidatura_em: "desc" },
    take: 1,
  });

  const vaga = candidaturas[0]?.vaga;
  const palavrasChave = vaga?.tecnologias?.length
    ? vaga.tecnologias
    : ["javascript", "react", "node", "sql"];

  try {
    const resultado = await analisarTextoCV(
      profile.texto_extraido_cv,
      palavrasChave,
    );

    await prisma.perfis_candidatos.update({
      where: { id: profile.id },
      data: {
        nota_tecnica: resultado.nota_tecnica,
        nota_compatibilidade: resultado.nota_compatibilidade,
        ultima_analise_em: new Date(),
      },
    });

    return res.json(resultado);
  } catch (e) {
    return res.status(502).json({
      error: e instanceof Error ? e.message : "Falha na análise IA",
    });
  }
}

router.post(
  "/analisar-cv",
  authMiddleware([Role.CANDIDATO]),
  analisarCvHandler,
);

/** @deprecated Use POST /candidatos/analisar-cv */
router.post(
  "/analyze-cv",
  authMiddleware([Role.CANDIDATO]),
  analisarCvHandler,
);

router.get(
  "/diretorio",
  authMiddleware([Role.RECRUTADOR]),
  async (_req, res) => {
    const rows = await prisma.perfis_candidatos.findMany({
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
      orderBy: { nota_tecnica: "desc" },
    });

    return res.json(rows);
  },
);

/** @deprecated Use GET /candidatos/diretorio */
router.get("/directory", authMiddleware([Role.RECRUTADOR]), async (req, res) => {
  const rows = await prisma.perfis_candidatos.findMany({
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
    orderBy: { nota_tecnica: "desc" },
  });
  return res.json(rows);
});

export default router;
