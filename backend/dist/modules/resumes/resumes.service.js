"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumesService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const prisma_1 = require("../../config/prisma");
const encryption_1 = require("../../utils/encryption");
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
exports.resumesService = {
    async upload(candidatoId, file) {
        // 1. extrai texto do PDF
        const parsed = await (0, pdf_parse_1.default)(file.buffer);
        const textoExtraido = parsed.text.trim();
        // 2. criptografa e salva no disco
        await promises_1.default.mkdir(env_1.env.UPLOAD_DIR, { recursive: true });
        const filename = `${candidatoId}-${crypto_1.default.randomBytes(8).toString("hex")}.enc`;
        const fullPath = path_1.default.join(env_1.env.UPLOAD_DIR, filename);
        const encrypted = (0, encryption_1.encryptBuffer)(file.buffer);
        await promises_1.default.writeFile(fullPath, encrypted);
        // 3. registra no banco
        return prisma_1.prisma.resume.create({
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
    async listByUser(candidatoId) {
        return prisma_1.prisma.resume.findMany({
            where: { candidatoId },
            orderBy: { createdAt: "desc" },
            select: { id: true, nomeArquivo: true, createdAt: true },
        });
    },
    async getLastByUser(candidatoId) {
        const r = await prisma_1.prisma.resume.findFirst({
            where: { candidatoId },
            orderBy: { createdAt: "desc" },
        });
        if (!r)
            throw new errors_1.NotFoundError("Currículo não encontrado");
        return r;
    },
};
//# sourceMappingURL=resumes.service.js.map