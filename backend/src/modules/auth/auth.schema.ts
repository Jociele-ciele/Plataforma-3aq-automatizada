import { z } from "zod";

export const registerSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(100),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
  role: z.enum(["CANDIDATO", "RECRUTADOR"]).default("CANDIDATO"),
  github: z.string().optional(),
  aceitouLGPD: z.literal(true, {
    errorMap: () => ({ message: "Você precisa aceitar os termos da LGPD" }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1, "Informe a senha"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;