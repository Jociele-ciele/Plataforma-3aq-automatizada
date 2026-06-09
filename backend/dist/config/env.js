"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().default(4000),
    DATABASE_URL: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string().min(8),
    JWT_REFRESH_SECRET: zod_1.z.string().min(8),
    JWT_EXPIRES_IN: zod_1.z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default("7d"),
    UPLOAD_DIR: zod_1.z.string().default("./uploads"),
    ENCRYPTION_KEY: zod_1.z.string().length(32, "ENCRYPTION_KEY precisa ter 32 caracteres"),
    CORS_ORIGIN: zod_1.z.string().default("http://localhost:5173"),
    AI_SERVICE_URL: zod_1.z.string().default("http://localhost:8000"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Variáveis de ambiente inválidas:", parsed.error.format());
    throw new Error("Erro nas variáveis de ambiente — confira o .env");
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map