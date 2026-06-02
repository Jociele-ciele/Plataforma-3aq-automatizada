import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../src/modules/auth/auth.schema";

describe("Schemas de auth", () => {
  it("rejeita cadastro sem aceitar LGPD", () => {
    const r = registerSchema.safeParse({
      nome: "Maria",
      email: "maria@x.com",
      senha: "123456",
      role: "CANDIDATO",
      aceitouLGPD: false,
    });
    expect(r.success).toBe(false);
  });

  it("aceita cadastro válido", () => {
    const r = registerSchema.safeParse({
      nome: "Maria",
      email: "maria@x.com",
      senha: "123456",
      role: "CANDIDATO",
      aceitouLGPD: true,
    });
    expect(r.success).toBe(true);
  });

  it("rejeita senha curta", () => {
    const r = registerSchema.safeParse({
      nome: "M",
      email: "x@x.com",
      senha: "123",
      role: "CANDIDATO",
      aceitouLGPD: true,
    });
    expect(r.success).toBe(false);
  });

  it("rejeita login sem e-mail", () => {
    const r = loginSchema.safeParse({ senha: "abc" });
    expect(r.success).toBe(false);
  });
});
