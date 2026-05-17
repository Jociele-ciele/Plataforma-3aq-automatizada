"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
const idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
const criarVagaSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(2),
    descricao: zod_1.z.string().min(10),
    tecnologias: zod_1.z.array(zod_1.z.string()).default([]),
    criterios: zod_1.z.record(zod_1.z.unknown()).optional(),
});
const criteriosPadrao = {
    pesos: {
        palavras_chave_cv: 0.2,
        github: 0.2,
        teste_tecnico: 0.6,
    },
};
router.get("/", async (_req, res) => {
    const vagas = await db_js_1.prisma.vagas.findMany({
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
router.get("/admin/todas", (0, auth_js_1.authMiddleware)([client_1.Role.RECRUTADOR]), async (req, res) => {
    const vagas = await db_js_1.prisma.vagas.findMany({
        where: { recrutador_id: req.auth.userId },
        orderBy: { criado_em: "desc" },
        include: {
            _count: { select: { candidaturas: true } },
        },
    });
    return res.json(vagas);
});
/** @deprecated Use GET /vagas/admin/todas */
router.get("/admin/all", (0, auth_js_1.authMiddleware)([client_1.Role.RECRUTADOR]), async (req, res) => {
    const vagas = await db_js_1.prisma.vagas.findMany({
        where: { recrutador_id: req.auth.userId },
        orderBy: { criado_em: "desc" },
        include: {
            _count: { select: { candidaturas: true } },
        },
    });
    return res.json(vagas);
});
router.get("/:id", async (req, res) => {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
        return res.status(400).json({ error: "ID de vaga inválido" });
    }
    const vaga = await db_js_1.prisma.vagas.findUnique({
        where: { id: parsed.data.id },
        include: { desafios: true },
    });
    if (!vaga) {
        return res.status(404).json({ error: "Vaga não encontrada" });
    }
    return res.json(vaga);
});
router.post("/", (0, auth_js_1.authMiddleware)([client_1.Role.RECRUTADOR]), async (req, res) => {
    const parsed = criarVagaSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Dados inválidos",
            details: parsed.error.flatten(),
        });
    }
    const vaga = await db_js_1.prisma.vagas.create({
        data: {
            titulo: parsed.data.titulo,
            descricao: parsed.data.descricao,
            tecnologias: parsed.data.tecnologias,
            criterios: (parsed.data.criterios ?? criteriosPadrao),
            recrutador_id: req.auth.userId,
        },
    });
    return res.status(201).json(vaga);
});
exports.default = router;
//# sourceMappingURL=vagas.js.map