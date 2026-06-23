import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import pdfParse from "pdf-parse";
import { prisma } from "../../config/prisma";
import { encryptBuffer, decryptBuffer } from "../../utils/encryption";
import { env } from "../../config/env";
import { AppError, ForbiddenError, NotFoundError } from "../../utils/errors";
import { applicationsService } from "../applications/applications.service";

export const resumesService = {
  async upload(candidatoId: string, file: Express.Multer.File) {
    const parsed = await pdfParse(file.buffer);
    const textoExtraido = parsed.text.trim();

    if (!textoExtraido || textoExtraido.length < 20) {
      throw new AppError(
        "Não foi possível ler o texto do PDF. Salve novamente como PDF (não imagem) ou exporte do Word com texto selecionável.",
        400
      );
    }

    await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
    const filename = `${candidatoId}-${crypto.randomBytes(8).toString("hex")}.enc`;
    const fullPath = path.join(env.UPLOAD_DIR, filename);
    const encrypted = encryptBuffer(file.buffer);
    await fs.writeFile(fullPath, encrypted);

    const resume = await prisma.resume.create({
      data: {
        candidatoId,
        arquivo: filename,
        nomeArquivo: file.originalname,
        textoExtraido,
      },
      select: {
        id: true,
        nomeArquivo: true,
        textoExtraido: true,
        createdAt: true,
      },
    });

    // Atualiza notas das inscrições já feitas com o novo currículo
    await applicationsService.reanalisarCurriculoDasInscricoes(candidatoId).catch((e) => {
      console.warn("[Resume] falha ao reanalisar inscrições:", (e as Error).message);
    });

    return resume;
  },

  async listByUser(candidatoId: string) {
    return prisma.resume.findMany({
      where: { candidatoId },
      orderBy: { createdAt: "desc" },
      select: { id: true, nomeArquivo: true, createdAt: true },
    });
  },

  async getLastByUser(candidatoId: string) {
    const r = await prisma.resume.findFirst({
      where: { candidatoId },
      orderBy: { createdAt: "desc" },
    });
    if (!r) throw new NotFoundError("Currículo não encontrado");
    return r;
  },

  async assertCanAccess(resumeId: string, userId: string, role: string) {
    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume) throw new NotFoundError("Currículo não encontrado");

    if (role === "CANDIDATO" && resume.candidatoId === userId) return resume;

    if (role === "RECRUTADOR") {
      const inscricao = await prisma.application.findFirst({
        where: {
          candidatoId: resume.candidatoId,
          vaga: { recrutadorId: userId },
        },
      });
      if (inscricao) return resume;
    }

    throw new ForbiddenError("Sem permissão para acessar este currículo");
  },

  async downloadPdf(resumeId: string, userId: string, role: string) {
    const resume = await this.assertCanAccess(resumeId, userId, role);
    const fullPath = path.join(env.UPLOAD_DIR, resume.arquivo);
    const encrypted = await fs.readFile(fullPath);
    const pdf = decryptBuffer(encrypted);
    return { pdf, nomeArquivo: resume.nomeArquivo };
  },
};