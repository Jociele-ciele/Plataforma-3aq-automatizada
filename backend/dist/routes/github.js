"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
const githubService_js_1 = require("../services/githubService.js");
const router = (0, express_1.Router)();
async function analisarHandler(req, res) {
    const schema = zod_1.z.object({ login: zod_1.z.string().min(1).optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Dados inválidos" });
    }
    const user = await db_js_1.prisma.users.findUnique({
        where: { id: req.auth.userId },
        select: { github_login: true },
    });
    const login = parsed.data.login?.trim() || user?.github_login;
    if (!login) {
        return res.status(400).json({
            error: "Informe o github_login no perfil ou na requisição",
        });
    }
    try {
        const analise = await (0, githubService_js_1.analisarGithubPublico)(login);
        const profile = await db_js_1.prisma.perfis_candidatos.findUnique({
            where: { usuario_id: req.auth.userId },
        });
        if (profile) {
            await db_js_1.prisma.perfis_candidatos.update({
                where: { id: profile.id },
                data: { analise_github_json: analise },
            });
        }
        await db_js_1.prisma.users.update({
            where: { id: req.auth.userId },
            data: { github_login: login },
        });
        return res.json(analise);
    }
    catch (e) {
        return res.status(502).json({
            error: e instanceof Error ? e.message : "Falha GitHub",
        });
    }
}
router.post("/analisar", (0, auth_js_1.authMiddleware)([client_1.Role.CANDIDATO]), analisarHandler);
/** @deprecated Use POST /github/analisar */
router.post("/analyze", (0, auth_js_1.authMiddleware)([client_1.Role.CANDIDATO]), analisarHandler);
exports.default = router;
//# sourceMappingURL=github.js.map