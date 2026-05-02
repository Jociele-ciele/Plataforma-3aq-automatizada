import { Router } from "express";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db.js";
import { authMiddleware, signToken } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  githubLogin: z.string().optional(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  const { email, password, name, githubLogin } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    res.status(409).json({ error: "Email já registado" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: Role.CANDIDATE,
      githubLogin: githubLogin || null,
      candidateProfile: { create: {} },
    },
  });
  const token = signToken({ sub: user.id, role: user.role });
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Credenciais inválidas" });
    return;
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Email ou palavra-passe incorretos" });
    return;
  }
  const token = signToken({ sub: user.id, role: user.role });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

router.get("/me", authMiddleware(), async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.userId },
    include: { candidateProfile: true },
  });
  if (!user) {
    res.status(404).json({ error: "Não encontrado" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    githubLogin: user.githubLogin,
    candidateProfile: user.candidateProfile,
  });
});

export default router;
