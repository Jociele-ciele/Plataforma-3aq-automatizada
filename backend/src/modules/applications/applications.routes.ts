import { Router } from "express";
import { applicationsController } from "./applications.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { asyncHandler } from "../../utils/async-handler";

const router = Router();
router.use(authenticate);

router.get("/mine", authorize("CANDIDATO"), asyncHandler(applicationsController.listMine));
router.get(
  "/by-job/:vagaId",
  authorize("RECRUTADOR"),
  asyncHandler(applicationsController.listByJob)
);
router.get("/:id", asyncHandler(applicationsController.getById));
router.post(
  "/job/:vagaId",
  authorize("CANDIDATO"),
  asyncHandler(applicationsController.apply)
);
router.put(
  "/:id/status",
  authorize("RECRUTADOR"),
  asyncHandler(applicationsController.setStatus)
);
router.post("/:id/refresh-score", asyncHandler(applicationsController.refreshScore));

export default router;