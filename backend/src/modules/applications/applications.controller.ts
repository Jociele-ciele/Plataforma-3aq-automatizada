import { Request, Response } from "express";
import { z } from "zod";
import { applicationsService } from "./applications.service";
import { auditLog } from "../../middleware/audit";

const statusSchema = z.object({
  status: z.enum(["APROVADO", "REPROVADO", "EM_ANALISE"]),
  feedback: z.string().optional(),
});

export const applicationsController = {
  async apply(req: Request, res: Response) {
    const app = await applicationsService.apply(req.user!.sub, req.params.vagaId);
    await auditLog(req, "APPLY_JOB", "Application", { id: app.id });
    return res.status(201).json(app);
  },

  async listMine(req: Request, res: Response) {
    return res.json(await applicationsService.listMine(req.user!.sub));
  },

  async listByJob(req: Request, res: Response) {
    return res.json(
      await applicationsService.listByJob(req.params.vagaId, req.user!.sub)
    );
  },

  async getById(req: Request, res: Response) {
    return res.json(
      await applicationsService.getById(req.params.id, req.user!.sub, req.user!.role)
    );
  },

  async setStatus(req: Request, res: Response) {
    const data = statusSchema.parse(req.body);
    const r = await applicationsService.setStatus(
      req.params.id,
      req.user!.sub,
      data.status,
      data.feedback
    );
    await auditLog(req, "SET_STATUS", "Application", { id: r.id, status: r.status });
    return res.json(r);
  },

  async refreshScore(req: Request, res: Response) {
    return res.json(await applicationsService.atualizarNotaFinal(req.params.id));
  },
};