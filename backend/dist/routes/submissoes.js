"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
const codeRunner_js_1 = require("../services/codeRunner.js");
const router = (0, express_1.Router)();
const submitSchema = zod_1.z.object({
    candidatura_id: zod_1.z.string().uuid(),
    desafio_id: zod_1.z.string().uuid(),
    codigo: zod_1.z.string().min(5),
});
router.post("/", (0, auth_js_1.authMiddleware)([client_1.Role.CANDIDATO]), async (req, res) => {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Payload inválido",
            details: parsed.error.flatten(),
        });
    }
    const profile = await db_js_1.prisma.perfis_candidatos.findUnique({
        where: { usuario_id: req.auth.userId },
    });
    if (!profile) {
        return res.status(403).json({ error: "Perfil não encontrado" });
    }
    const candidatura = await db_js_1.prisma.candidaturas.findFirst({
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
    const desafio = await db_js_1.prisma.desafios.findFirst({
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
    const casosTeste = desafio.casos_teste;
    const resultado = (0, codeRunner_js_1.executarDesafioJavascript)(parsed.data.codigo, casosTeste, desafio.limite_tempo_ms);
    const feedback = resultado.detalhes.join("\n");
    const submissao = await db_js_1.prisma.submissoes.create({
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
    await db_js_1.prisma.candidaturas.update({
        where: { id: candidatura.id },
        data: {
            status: resultado.percentual_nota >= 70 ? "REVISADO" : "EM_TESTE",
        },
    });
    return res.status(201).json({
        testes_aprovados: submissao.testes_aprovados,
        total_testes: submissao.total_testes,
        percentual_nota: submissao.percentual_nota,
        feedback: submissao.feedback,
        message: "Resultado disponível imediatamente. Em produção, execute em ambiente isolado.",
    });
});
exports.default = router;
//# sourceMappingURL=submissoes.js.map