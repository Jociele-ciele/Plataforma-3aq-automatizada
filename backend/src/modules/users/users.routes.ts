import { Router } from "express";
import { z } from "zod";
import { usersController } from "./users.controller";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";

const router = Router();
router.use(authenticate);

const updateSchema = z.object({
  nome: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  github: z.string().optional(),
});

router.get("/me", asyncHandler(usersController.profile));
router.put("/me", validate(updateSchema), asyncHandler(usersController.updateProfile));
router.get("/me/export", asyncHandler(usersController.exportData));
router.delete("/me", asyncHandler(usersController.deleteAccount));

export default router;