import { Request, Response } from "express";
import { usersService } from "./users.service";
import { auditLog } from "../../middleware/audit";

export const usersController = {
  async profile(req: Request, res: Response) {
    const user = await usersService.getProfile(req.user!.sub);
    return res.json(user);
  },

  async updateProfile(req: Request, res: Response) {
    const user = await usersService.updateProfile(req.user!.sub, req.body);
    await auditLog(req, "UPDATE_PROFILE", "User");
    return res.json(user);
  },

  async exportData(req: Request, res: Response) {
    const data = await usersService.exportData(req.user!.sub);
    await auditLog(req, "EXPORT_DATA_LGPD", "User");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=meus-dados.json");
    return res.send(JSON.stringify(data, null, 2));
  },

  async deleteAccount(req: Request, res: Response) {
    await auditLog(req, "DELETE_ACCOUNT_LGPD", "User", { userId: req.user!.sub });
    await usersService.deleteAccount(req.user!.sub);
    return res.status(204).send();
  },
};