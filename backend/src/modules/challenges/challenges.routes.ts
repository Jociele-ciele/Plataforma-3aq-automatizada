import { Router } from "express";
import { challengesController } from "./challenges.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { createChallengeSchema, submitChallengeSchema } from "./challenges.schema";

const router = Router();
router.use(authenticate);

router.post(
  "/",
  authorize("RECRUTADOR"),
  validate(createChallengeSchema),
  asyncHandler(challengesController.create)
);
router.get("/by-job/:vagaId", asyncHandler(challengesController.listByJob));
router.get("/:id", asyncHandler(challengesController.getById));
router.post(
  "/:id/submit",
  authorize("CANDIDATO"),
  validate(submitChallengeSchema),
  asyncHandler(challengesController.submit)
);
router.delete("/:id", authorize("RECRUTADOR"), asyncHandler(challengesController.remove));

export default router;