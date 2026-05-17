import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { prisma } from "../db.js";
import type { Role } from "@prisma/client";

export type AuthPayload = { sub: string; role: Role };

declare module "express-serve-static-core" {
  interface Request {
    auth?: { userId: string; role: Role };
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}

export function authMiddleware(requiredRoles?: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      res.status(401).json({ error: "Token em falta" });
      return;
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
      const user = await prisma.users.findUnique({
        where: { id: decoded.sub },
      });
      if (!user) {
        res.status(401).json({ error: "Utilizador inválido" });
        return;
      }
      if (requiredRoles?.length && !requiredRoles.includes(user.role)) {
        res.status(403).json({ error: "Permissão negada" });
        return;
      }
      req.auth = { userId: user.id, role: user.role };
      next();
    } catch {
      res.status(401).json({ error: "Token inválido" });
    }
  };
}
