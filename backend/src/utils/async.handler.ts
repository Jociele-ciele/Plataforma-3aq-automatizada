import { Request, Response, NextFunction, RequestHandler } from "express";

// Wrapper para evitar try/catch em cada controller — repassa erros ao middleware global.
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };