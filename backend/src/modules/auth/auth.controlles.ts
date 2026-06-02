import { Request, Response } from "express";
import { authService } from "./auth.service";
import { auditLog } from "../../middleware/audit";

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    await auditLog(req, "REGISTER", "User", { userId: result.user.id });
    return res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    await auditLog(req, "LOGIN", "User", { userId: result.user.id });
    return res.json(result);
  },

  async refresh(req: Request, res: Response) {
    const tokens = await authService.refresh(req.body.refreshToken);
    return res.json(tokens);
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.body.refreshToken);
    await auditLog(req, "LOGOUT", "User");
    return res.status(204).send();
  },

  async me(req: Request, res: Response) {
    return res.json({ user: req.user });
  },
};