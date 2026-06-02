import { Request, Response } from "express";
import { jobsService } from "./jobs.service";
import { auditLog } from "../../middleware/audit";

export const jobsController = {
  async list(req: Request, res: Response) {
    const { status, q } = req.query as { status?: string; q?: string };
    return res.json(await jobsService.list({ status, q }));
  },

  async listMine(req: Request, res: Response) {
    return res.json(await jobsService.myJobs(req.user!.sub));
  },

  async getById(req: Request, res: Response) {
    return res.json(await jobsService.getById(req.params.id));
  },

  async create(req: Request, res: Response) {
    const job = await jobsService.create(req.user!.sub, req.body);
    await auditLog(req, "CREATE_JOB", "Job", { jobId: job.id });
    return res.status(201).json(job);
  },

  async update(req: Request, res: Response) {
    const job = await jobsService.update(req.params.id, req.user!.sub, req.body);
    await auditLog(req, "UPDATE_JOB", "Job", { jobId: job.id });
    return res.json(job);
  },

  async close(req: Request, res: Response) {
    const job = await jobsService.close(req.params.id, req.user!.sub);
    await auditLog(req, "CLOSE_JOB", "Job", { jobId: job.id });
    return res.json(job);
  },

  async remove(req: Request, res: Response) {
    await jobsService.remove(req.params.id, req.user!.sub);
    await auditLog(req, "DELETE_JOB", "Job", { jobId: req.params.id });
    return res.status(204).send();
  },
};