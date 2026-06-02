import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  UPLOAD_DIR: z.string().default("./uploads"),
  ENCRYPTION_KEY: z.string().length(32, "ENCRYPTION_KEY precisa ter 32 caracteres"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  AI_SERVICE_URL: z.string().default("http://localhost:8000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:", parsed.error.format());
  throw new Error("Erro nas variáveis de ambiente — confira o .env");
}

export const env = parsed.data;