import { Router } from "express";
import { jobsController } from "./jobs.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { createJobSchema, updateJobSchema } from "./jobs.schema";

const router = Router();

router.get("/", asyncHandler(jobsController.list));
router.get("/mine", authenticate, authorize("RECRUTADOR"), asyncHandler(jobsController.listMine));
router.get("/:id", asyncHandler(jobsController.getById));

router.post(
  "/",
  authenticate,
  authorize("RECRUTADOR"),
  validate(createJobSchema),
  asyncHandler(jobsController.create)
);
router.put(
  "/:id",
  authenticate,
  authorize("RECRUTADOR"),
  validate(updateJobSchema),
  asyncHandler(jobsController.update)
);
router.post(
  "/:id/close",
  authenticate,
  authorize("RECRUTADOR"),
  asyncHandler(jobsController.close)
);
router.delete(
  "/:id",
  authenticate,
  authorize("RECRUTADOR"),
  asyncHandler(jobsController.remove)
);

export default router;