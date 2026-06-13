import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Valida `body` contra um schema Zod. Substitui `req.body` pela versão validada.
export const validate =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };

export const validateQuery =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    req.query = schema.parse(req.query) as typeof req.query;
    next();
  };
