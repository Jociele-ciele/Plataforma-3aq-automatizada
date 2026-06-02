import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

beforeAll(() => {
  process.env.JWT_SECRET = "x".repeat(16);
  process.env.JWT_REFRESH_SECRET = "y".repeat(16);
  process.env.DATABASE_URL = "postgresql://u:p@localhost:5432/t";
  process.env.ENCRYPTION_KEY = "x".repeat(32);
  process.env.NODE_ENV = "test";
});

describe("Rotas protegidas", () => {
  it("rejeita /users/me sem token", async () => {
    const { createApp } = await import("../src/app");
    const app = createApp();
    const r = await request(app).get("/api/users/me");
    expect(r.status).toBe(401);
  });

  it("rejeita /jobs/mine sem token", async () => {
    const { createApp } = await import("../src/app");
    const app = createApp();
    const r = await request(app).get("/api/jobs/mine");
    expect(r.status).toBe(401);
  });

  it("aceita login com payload inválido (validação Zod)", async () => {
    const { createApp } = await import("../src/app");
    const app = createApp();
    const r = await request(app)
      .post("/api/auth/login")
      .send({ email: "n", senha: "" });
    expect(r.status).toBe(400);
    expect(r.body.error).toBe("Dados inválidos");
  });
});