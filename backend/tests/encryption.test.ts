import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.JWT_SECRET = "x".repeat(16);
  process.env.JWT_REFRESH_SECRET = "y".repeat(16);
  process.env.DATABASE_URL = "postgresql://u:p@localhost:5433/t";
  process.env.ENCRYPTION_KEY = "x".repeat(32);
});

describe("Criptografia de buffer", () => {
  it("encripta e decripta sem perder dados", async () => {
    const { encryptBuffer, decryptBuffer } = await import("../src/utils/encryption");
    const original = Buffer.from("conteúdo super secreto do currículo 🔒");
    const enc = encryptBuffer(original);
    expect(enc.equals(original)).toBe(false);
    const dec = decryptBuffer(enc);
    expect(dec.toString()).toBe(original.toString());
  });
});