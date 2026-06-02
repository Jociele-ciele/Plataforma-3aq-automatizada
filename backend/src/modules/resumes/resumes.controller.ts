import { Request, Response } from "express";
import { resumesService } from "./resumes.service";
import { AppError } from "../../utils/errors";
import { auditLog } from "../../middleware/audit";

export const resumesController = {
  async upload(req: Request, res: Response) {
    if (!req.file) throw new AppError("Envie um arquivo PDF no campo 'curriculo'", 400);
    if (req.file.mimetype !== "application/pdf") {
      throw new AppError("O arquivo precisa ser PDF", 400);
    }
    const r = await resumesService.upload(req.user!.sub, req.file);
    await auditLog(req, "UPLOAD_RESUME", "Resume", { resumeId: r.id });
    return res.status(201).json(r);
  },

  async list(req: Request, res: Response) {
    return res.json(await resumesService.listByUser(req.user!.sub));
  },

  async last(req: Request, res: Response) {
    return res.json(await resumesService.getLastByUser(req.user!.sub));
  },
};