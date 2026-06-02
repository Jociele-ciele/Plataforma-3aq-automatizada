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
router.use(authenticate, authorize("CANDIDATO"));

router.post("/", upload.single("curriculo"), asyncHandler(resumesController.upload));
router.get("/", asyncHandler(resumesController.list));
router.get("/last", asyncHandler(resumesController.last));

export default router;