"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = require("express");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const config_js_1 = require("../config.js");
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
const fileCrypto_js_1 = require("../services/fileCrypto.js");
const aiClient_js_1 = require("../services/aiClient.js");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});
router.post("/cv", (0, auth_js_1.authMiddleware)([client_1.Role.CANDIDATO]), (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err)
            return next(err);
        return void handleUploadCv(req, res);
    });
});
async function handleUploadCv(req, res) {
    if (!req.file) {
        return res.status(400).json({
            error: "Arquivo não enviado (campo file)",
        });
    }
    const profile = await db_js_1.prisma.perfis_candidatos.findUnique({
        where: { usuario_id: req.auth.userId },
    });
    if (!profile) {
        return res.status(400).json({ error: "Perfil não encontrado" });
    }
    const nomeArquivo = await (0, fileCrypto_js_1.writeEncryptedFile)(config_js_1.config.uploadDir, req.file.originalname, req.file.buffer);
    const isTexto = req.file.mimetype === "text/plain" ||
        (req.file.mimetype === "application/octet-stream" &&
            req.file.originalname.toLowerCase().endsWith(".txt"));
    const updateData = {
        caminho_cv: path_1.default.join(config_js_1.config.uploadDir, nomeArquivo),
        tipo_mime_cv: req.file.mimetype,
    };
    if (isTexto) {
        updateData.texto_extraido_cv = req.file.buffer.toString("utf8");
    }
    await db_js_1.prisma.perfis_candidatos.update({
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
async function analisarCvHandler(req, res) {
    const profile = await db_js_1.prisma.perfis_candidatos.findUnique({
        where: { usuario_id: req.auth.userId },
    });
    if (!profile?.texto_extraido_cv?.trim()) {
        return res.status(400).json({
            error: "Envie um currículo em formato .txt para extrair o texto antes da análise.",
        });
    }
    const candidaturas = await db_js_1.prisma.candidaturas.findMany({
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
        const resultado = await (0, aiClient_js_1.analisarTextoCV)(profile.texto_extraido_cv, palavrasChave);
        await db_js_1.prisma.perfis_candidatos.update({
            where: { id: profile.id },
            data: {
                nota_tecnica: resultado.nota_tecnica,
                nota_compatibilidade: resultado.nota_compatibilidade,
                ultima_analise_em: new Date(),
            },
        });
        return res.json(resultado);
    }
    catch (e) {
        return res.status(502).json({
            error: e instanceof Error ? e.message : "Falha na análise IA",
        });
    }
}
router.post("/analisar-cv", (0, auth_js_1.authMiddleware)([client_1.Role.CANDIDATO]), analisarCvHandler);
/** @deprecated Use POST /candidatos/analisar-cv */
router.post("/analyze-cv", (0, auth_js_1.authMiddleware)([client_1.Role.CANDIDATO]), analisarCvHandler);
router.get("/diretorio", (0, auth_js_1.authMiddleware)([client_1.Role.RECRUTADOR]), async (_req, res) => {
    const rows = await db_js_1.prisma.perfis_candidatos.findMany({
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
/** @deprecated Use GET /candidatos/diretorio */
router.get("/directory", (0, auth_js_1.authMiddleware)([client_1.Role.RECRUTADOR]), async (req, res) => {
    const rows = await db_js_1.prisma.perfis_candidatos.findMany({
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
exports.default = router;
//# sourceMappingURL=candidatos.js.map