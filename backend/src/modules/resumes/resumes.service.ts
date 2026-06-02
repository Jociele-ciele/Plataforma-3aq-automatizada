import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import pdfParse from "pdf-parse";
import { prisma } from "../../config/prisma";
import { encryptBuffer } from "../../utils/encryption";
import { env } from "../../config/env";
import { NotFoundError } from "../../utils/errors";

export const resumesService = {
  async upload(candidatoId: string, file: Express.Multer.File) {
    // 1. extrai texto do PDF
    const parsed = await pdfParse(file.buffer);
    const textoExtraido = parsed.text.trim();

    // 2. criptografa e salva no disco
    await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
    const filename = `${candidatoId}-${crypto.randomBytes(8).toString("hex")}.enc`;
    const fullPath = path.join(env.UPLOAD_DIR, filename);
    const encrypted = encryptBuffer(file.buffer);
    await fs.writeFile(fullPath, encrypted);

    // 3. registra no banco
    return prisma.resume.create({
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
};