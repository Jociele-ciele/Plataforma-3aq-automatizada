import path from "node:path";
import fs from "node:fs/promises";
import { Router } from "express";
import { Role } from "@prisma/client";
import multer from "multer";
import { config } from "../config.js";
import { prisma } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { writeEncryptedFile } from "../services/fileCrypto.js";
import { analyzeCvText } from "../services/aiClient.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/cv",
  authMiddleware([Role.CANDIDATE]),
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "Ficheiro em falta (campo file)" });
      return;
    }
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.auth!.userId },
    });
    if (!profile) {
      res.status(400).json({ error: "Perfil em falta" });
      return;
    }
    let extracted = "";
    if (req.file.mimetype === "text/plain") {
      extracted = req.file.buffer.toString("utf8");
    } else {
      extracted =
        "[Protótipo] Texto não extraído automaticamente deste tipo MIME. Envie .txt ou atualize o pipeline com pdf-parse/OCR.";
    }
    const storedName = await writeEncryptedFile(
      config.uploadDir,
      req.file.originalname,
      req.file.buffer,
    );
    await prisma.candidateProfile.update({
      where: { id: profile.id },
      data: {
        cvFilePath: path.join(config.uploadDir, storedName),
        cvMimeType: req.file.mimetype,
        cvExtractedText: extracted || profile.cvExtractedText,
      },
    });
    res.json({
      ok: true,
      message:
        "Currículo guardado com políticas de encriptação em repouso quando configurado.",
    });
  },
);

router.post(
  "/analyze-cv",
  authMiddleware([Role.CANDIDATE]),
  async (req, res) => {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.auth!.userId },
      include: { user: true },
    });
    if (!profile?.cvExtractedText) {
      res.status(400).json({
        error:
          "Envie e extraia texto do CV primeiro (upload .txt recomendado no protótipo)",
      });
      return;
    }
    const applications = await prisma.application.findMany({
      where: { candidateId: profile.id },
      include: { job: true },
      orderBy: { appliedAt: "desc" },
      take: 1,
    });
    const job = applications[0]?.job;
    const keywords = job?.stack?.length
      ? job.stack
      : ["javascript", "react", "node", "sql"];

    try {
      const result = await analyzeCvText(profile.cvExtractedText, keywords);
      await prisma.candidateProfile.update({
        where: { id: profile.id },
        data: {
          technicalScore: result.technical_score,
          fitScore: result.fit_score,
          lastAnalysisAt: new Date(),
        },
      });
      res.json({
        technical_score: result.technical_score,
        fit_score: result.fit_score,
        summary: result.summary,
        matched_keywords: result.matched_keywords,
      });
    } catch (e) {
      res.status(502).json({
        error: e instanceof Error ? e.message : "Falha na triagem IA",
      });
    }
  },
);

/** Lista candidatos com scores (RH) */
router.get(
  "/directory",
  authMiddleware([Role.RECRUITER]),
  async (_req, res) => {
    const rows = await prisma.candidateProfile.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, githubLogin: true },
        },
      },
      orderBy: { technicalScore: "desc" },
    });
    res.json(rows);
  },
);

export default router;
