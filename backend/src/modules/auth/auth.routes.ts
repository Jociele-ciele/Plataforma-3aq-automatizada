import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { authLimiter } from "../../middleware/rate-limit";
import { asyncHandler } from "../../utils/async-handler";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schema";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post("/login", authLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post("/refresh", validate(refreshSchema), asyncHandler(authController.refresh));
router.post("/logout", validate(refreshSchema), asyncHandler(authController.logout));
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;