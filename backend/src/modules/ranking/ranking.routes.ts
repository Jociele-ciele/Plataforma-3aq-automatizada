import { Router } from "express";
import { rankingService } from "./ranking.service";
import { authenticate, authorize } from "../../middleware/auth";
import { asyncHandler } from "../../utils/async-handler";

const router = Router();
router.use(authenticate);

router.get(
  "/job/:vagaId",
  authorize("RECRUTADOR"),
  asyncHandler(async (req, res) => {
    return res.json(await rankingService.byJob(req.params.vagaId));
  })
);

router.get(
  "/dashboard/recrutador",
  authorize("RECRUTADOR"),
  asyncHandler(async (req, res) => {
    return res.json(await rankingService.dashboardRecrutador(req.user!.sub));
  })
);

router.get(
  "/dashboard/candidato",
  authorize("CANDIDATO"),
  asyncHandler(async (req, res) => {
    return res.json(await rankingService.dashboardCandidato(req.user!.sub));
  })
);

export default router;