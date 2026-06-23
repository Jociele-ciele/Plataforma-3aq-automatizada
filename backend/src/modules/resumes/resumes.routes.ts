import { Router } from "express";
import multer from "multer";
import { resumesController } from "./resumes.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { asyncHandler } from "../../utils/async-handler";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const router = Router();
router.use(authenticate);

router.post(
  "/",
  authorize("CANDIDATO"),
  upload.single("curriculo"),
  asyncHandler(resumesController.upload)
);
router.get("/", authorize("CANDIDATO"), asyncHandler(resumesController.list));
router.get("/last", authorize("CANDIDATO"), asyncHandler(resumesController.last));
router.get("/:id/download", asyncHandler(resumesController.download));

export default router;