import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.JWT_SECRET = "x".repeat(16);
  process.env.JWT_REFRESH_SECRET = "y".repeat(16);
  process.env.DATABASE_URL = "postgresql://u:p@localhost:5433/t";
  process.env.ENCRYPTION_KEY = "x".repeat(32);
});

describe("JWT", () => {
  it("gera e verifica token", async () => {
    const { signAccessToken, verifyAccessToken } = await import("../src/utils/jwt");
    const token = signAccessToken({ sub: "u1", email: "a@a.com", role: "CANDIDATO" });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe("u1");
    expect(payload.role).toBe("CANDIDATO");
  });
});
