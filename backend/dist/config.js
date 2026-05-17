"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const emptyToUndefined = (v) => v === "" || v === undefined ? undefined : v;
const configSchema = zod_1.z.object({
    port: zod_1.z.coerce.number().default(3001),
    jwtSecret: zod_1.z
        .string()
        .min(16, "JWT_SECRET deve ter pelo menos 16 caracteres"),
    databaseUrl: zod_1.z.string().url(),
    uploadDir: zod_1.z.string().default("./uploads"),
    aiServiceUrl: zod_1.z.string().url().default("http://localhost:8000"),
    encryptionKeyHex: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().optional()),
    githubToken: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().optional()),
});
exports.config = configSchema.parse({
    port: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    uploadDir: process.env.UPLOAD_DIR,
    aiServiceUrl: process.env.AI_SERVICE_URL,
    encryptionKeyHex: process.env.ENCRYPTION_KEY,
    githubToken: process.env.GITHUB_TOKEN,
});
//# sourceMappingURL=config.js.map