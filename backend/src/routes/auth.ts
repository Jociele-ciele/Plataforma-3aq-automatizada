import { Router } from "express";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db.js";
import { authMiddleware, signToken } from "../middleware/auth.js";

const router = Router();

const usuarioPublico = {
  id: true,
  email: true,
  nome: true,
  role: true,
  github_login: true,
} as const;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nome: z.string().min(2),
  github_login: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Dados inválidos",
      details: parsed.error.flatten(),
    });
  }

  const { email, password, nome, github_login } = parsed.data;

  const existe = await prisma.users.findUnique({ where: { email } });
  if (existe) {
    return res.status(409).json({ error: "Email já registrado" });
  }

  const senha_hash = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      email,
      senha_hash,
      nome,
      role: Role.CANDIDATO,
      github_login: github_login ?? null,
      perfis_candidatos: { create: {} },
    },
    select: usuarioPublico,
  });

  const token = signToken({ sub: user.id, role: user.role });

  return res.status(201).json({ token, user });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Credenciais inválidas" });
  }

  const { email, password } = parsed.data;

  const user = await prisma.users.findUnique({
    where: { email },
    select: { ...usuarioPublico, senha_hash: true },
  });

  if (!user || !(await bcrypt.compare(password, user.senha_hash))) {
    return res.status(401).json({ error: "Email ou senha incorretos" });
  }

  const { senha_hash: _, ...publico } = user;
  const token = signToken({ sub: publico.id, role: publico.role });

  return res.json({ token, user: publico });
});

router.get("/me", authMiddleware(), async (req, res) => {
  const user = await prisma.users.findUnique({
    where: { id: req.auth!.userId },
    select: {
      ...usuarioPublico,
      perfis_candidatos: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "Utilizador não encontrado" });
  }

  const { perfis_candidatos, ...dados } = user;

  return res.json({
    ...dados,
    perfil_candidato: perfis_candidatos,
  });
});

export default router;
