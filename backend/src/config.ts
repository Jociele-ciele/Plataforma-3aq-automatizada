import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  v === "" || v === undefined ? undefined : v;

const configSchema = z.object({
  port: z.coerce.number().default(3001),
  jwtSecret: z
    .string()
    .min(16, "JWT_SECRET deve ter pelo menos 16 caracteres"),
  databaseUrl: z.string().url(),
  uploadDir: z.string().default("./uploads"),
  aiServiceUrl: z.string().url().default("http://localhost:8000"),
  encryptionKeyHex: z.preprocess(emptyToUndefined, z.string().optional()),
  githubToken: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const config = configSchema.parse({
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  uploadDir: process.env.UPLOAD_DIR,
  aiServiceUrl: process.env.AI_SERVICE_URL,
  encryptionKeyHex: process.env.ENCRYPTION_KEY,
  githubToken: process.env.GITHUB_TOKEN,
});
