import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

beforeAll(() => {
  process.env.JWT_SECRET = "x".repeat(16);
  process.env.JWT_REFRESH_SECRET = "y".repeat(16);
  process.env.DATABASE_URL = "postgresql://u:p@localhost:5432/t";
  process.env.ENCRYPTION_KEY = "x".repeat(32);
  process.env.NODE_ENV = "test";
});

describe("Endpoint /api/health", () => {
  it("responde com ok=true", async () => {
    const { createApp } = await import("../src/app");
    const app = createApp();
    const r = await request(app).get("/api/health");
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(true);
    expect(r.body.service).toBe("3aq-talent-backend");
  });

  it("retorna 404 em rota desconhecida", async () => {
    const { createApp } = await import("../src/app");
    const app = createApp();
    const r = await request(app).get("/api/nao-existe");
    expect(r.status).toBe(404);
  });
});