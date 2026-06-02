import { Request } from "express";
import { prisma } from "../config/prisma";

// Registra ação importante no log de auditoria (LGPD).
export async function auditLog(
  req: Request,
  acao: string,
  entidade?: string,
  detalhes?: Record<string, unknown>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.sub ?? null,
        acao,
        entidade,
        detalhes: detalhes as never,
        ip: req.ip ?? null,
      },
    });
  } catch (e) {
    console.error("[AUDIT_LOG] falhou:", e);
  }
}