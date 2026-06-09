"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    nome: zod_1.z.string().min(2, "Nome muito curto").max(100),
    email: zod_1.z.string().email("E-mail inválido"),
    senha: zod_1.z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
    role: zod_1.z.enum(["CANDIDATO", "RECRUTADOR"]).default("CANDIDATO"),
    github: zod_1.z.string().optional(),
    aceitouLGPD: zod_1.z.literal(true, {
        errorMap: () => ({ message: "Você precisa aceitar os termos da LGPD" }),
    }),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    senha: zod_1.z.string().min(1, "Informe a senha"),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(10),
});
//# sourceMappingURL=auth.schema.js.map