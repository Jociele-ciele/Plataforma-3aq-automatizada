import { Request, Response } from "express";
import { challengesService } from "./challenges.service";
import { auditLog } from "../../middleware/audit";

export const challengesController = {
  async create(req: Request, res: Response) {
    const c = await challengesService.create(req.user!.sub, req.body);
    await auditLog(req, "CREATE_CHALLENGE", "Challenge", { id: c.id });
    return res.status(201).json(c);
  },

  async listByJob(req: Request, res: Response) {
    const paraCandidato = req.user?.role === "CANDIDATO";
    return res.json(await challengesService.listByJob(req.params.vagaId, paraCandidato));
  },

  async getById(req: Request, res: Response) {
    const challenge = await challengesService.getById(req.params.id);
    if (req.user?.role === "CANDIDATO") {
      const { respostaCorreta, casosTeste, ...rest } = challenge;
      return res.json({
        ...rest,
        casosTesteExemplo: Array.isArray(casosTeste) ? casosTeste.slice(0, 2) : [],
      });
    }
    return res.json(challenge);
  },

  async submit(req: Request, res: Response) {
    const sub = await challengesService.submit(req.user!.sub, req.params.id, req.body);
    await auditLog(req, "SUBMIT_CHALLENGE", "Submission", { id: sub.id });
    return res.status(201).json(sub);
  },

  async remove(req: Request, res: Response) {
    await challengesService.remove(req.params.id, req.user!.sub);
    return res.status(204).send();
  },
};