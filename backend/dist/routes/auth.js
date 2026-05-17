"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
const usuarioPublico = {
    id: true,
    email: true,
    nome: true,
    role: true,
    github_login: true,
};
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    nome: zod_1.z.string().min(2),
    github_login: zod_1.z.string().min(1).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
router.post("/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Dados inválidos",
            details: parsed.error.flatten(),
        });
    }
    const { email, password, nome, github_login } = parsed.data;
    const existe = await db_js_1.prisma.users.findUnique({ where: { email } });
    if (existe) {
        return res.status(409).json({ error: "Email já registrado" });
    }
    const senha_hash = await bcryptjs_1.default.hash(password, 10);
    const user = await db_js_1.prisma.users.create({
        data: {
            email,
            senha_hash,
            nome,
            role: client_1.Role.CANDIDATO,
            github_login: github_login ?? null,
            perfis_candidatos: { create: {} },
        },
        select: usuarioPublico,
    });
    const token = (0, auth_js_1.signToken)({ sub: user.id, role: user.role });
    return res.status(201).json({ token, user });
});
router.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Credenciais inválidas" });
    }
    const { email, password } = parsed.data;
    const user = await db_js_1.prisma.users.findUnique({
        where: { email },
        select: { ...usuarioPublico, senha_hash: true },
    });
    if (!user || !(await bcryptjs_1.default.compare(password, user.senha_hash))) {
        return res.status(401).json({ error: "Email ou senha incorretos" });
    }
    const { senha_hash: _, ...publico } = user;
    const token = (0, auth_js_1.signToken)({ sub: publico.id, role: publico.role });
    return res.json({ token, user: publico });
});
router.get("/me", (0, auth_js_1.authMiddleware)(), async (req, res) => {
    const user = await db_js_1.prisma.users.findUnique({
        where: { id: req.auth.userId },
        select: {
            ...usuarioPublico,
            perfis_candidatos: true,
        },
    });
    if (!user) {
        return res.status(404).json({ error: "Utilizador não encontrado" });
    }
    const { perfis_candidatos, ...dados } = user;
    return res.json({
        ...dados,
        perfil_candidato: perfis_candidatos,
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map