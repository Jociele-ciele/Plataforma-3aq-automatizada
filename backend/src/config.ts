import { z } from "zod";

const configSchema = z.object({
  port: z.coerce.number().default(3001),
  jwtSecret: z.string().min(1),
  databaseUrl: z.string().url(),
  uploadDir: z.string().default("./uploads"),
});

export const config = configSchema.parse({
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  uploadDir: process.env.UPLOAD_DIR,
});
