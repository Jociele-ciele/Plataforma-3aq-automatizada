"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
const candidaturaSchema = zod_1.z.object({
    vaga_id: zod_1.z.string().uuid(),
});
router.post("/", (0, auth_js_1.authMiddleware)([client_1.Role.CANDIDATO]), async (req, res) => {
    const parsed = candidaturaSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "vaga_id inválido" });
    }
    const profile = await db_js_1.prisma.perfis_candidatos.findUnique({
        where: { usuario_id: req.auth.userId },
    });
    if (!profile) {
        return res.status(400).json({
            error: "Perfil de candidato não encontrado",
        });
    }
    const vaga = await db_js_1.prisma.vagas.findUnique({
        where: { id: parsed.data.vaga_id },
    });
    if (!vaga) {
        return res.status(404).json({ error: "Vaga não encontrada" });
    }
    if (!vaga.aberta) {
        return res.status(404).json({ error: "Vaga indisponível" });
    }
    try {
        const candidatura = await db_js_1.prisma.candidaturas.create({
            data: {
                vaga_id: vaga.id,
                candidato_id: profile.id,
                status: "ENVIADO",
            },
        });
        return res.status(201).json(candidatura);
    }
    catch (e) {
        if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002") {
            return res.status(409).json({
                error: "Já se candidatou a esta vaga",
            });
        }
        throw e;
    }
});
async function listarMinhas(req, res) {
    const profile = await db_js_1.prisma.perfis_candidatos.findUnique({
        where: { usuario_id: req.auth.userId },
    });
    if (!profile) {
        return res.json([]);
    }
    const candidaturas = await db_js_1.prisma.candidaturas.findMany({
        where: { candidato_id: profile.id },
        include: {
            vaga: {
                include: {
                    desafios: {
                        select: {
                            id: true,
                            titulo: true,
                            descricao: true,
                            codigo_inicial: true,
                        },
                    },
                },
            },
            submissoes: {
                orderBy: { criado_em: "desc" },
                take: 5,
            },
        },
        orderBy: { candidatura_em: "desc" },
    });
    return res.json(candidaturas);
}
router.get("/minhas", (0, auth_js_1.authMiddleware)([client_1.Role.CANDIDATO]), listarMinhas);
/** @deprecated Use GET /candidaturas/minhas */
router.get("/mine", (0, auth_js_1.authMiddleware)([client_1.Role.CANDIDATO]), listarMinhas);
router.get("/pipeline", (0, auth_js_1.authMiddleware)([client_1.Role.RECRUTADOR]), async (req, res) => {
    const vagas = await db_js_1.prisma.vagas.findMany({
        where: { recrutador_id: req.auth.userId },
        select: { id: true },
    });
    if (vagas.length === 0) {
        return res.json([]);
    }
    const candidaturas = await db_js_1.prisma.candidaturas.findMany({
        where: { vaga_id: { in: vagas.map((v) => v.id) } },
        include: {
            vaga: { select: { id: true, titulo: true } },
            candidato: {
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
            },
            submissoes: true,
        },
        orderBy: { candidatura_em: "desc" },
    });
    const ranking = candidaturas.map((c) => {
        const notaTeste = c.submissoes.length > 0
            ? Math.max(...c.submissoes.map((s) => s.percentual_nota))
            : 0;
        const notaTecnica = c.candidato.nota_tecnica ?? 0;
        const notaCompatibilidade = c.candidato.nota_compatibilidade ?? 0;
        const analiseGithub = c.candidato.analise_github_json;
        let notaGithub = 0;
        if (typeof analiseGithub === "object" && analiseGithub !== null) {
            const json = analiseGithub;
            notaGithub = Number(json.pontuacao_portfolio ?? json.portfolioScore ?? 0);
        }
        const pontuacao_ranking = Math.round((notaTeste * 0.6 +
            notaTecnica * 0.2 +
            Math.max(notaCompatibilidade, notaGithub) * 0.2) *
            100) / 100;
        return { ...c, pontuacao_ranking };
    });
    ranking.sort((a, b) => b.pontuacao_ranking - a.pontuacao_ranking);
    return res.json(ranking);
});
exports.default = router;
//# sourceMappingURL=candidaturas.js.map