import { Router } from "express";
import { z } from "zod";
import { githubService } from "./github.service";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";

const router = Router();
router.use(authenticate);

const schema = z.object({ github: z.string().min(1) });

router.post(
  "/analisar",
  validate(schema),
  asyncHandler(async (req, res) => {
    const r = await githubService.analisarUsuario(req.user!.sub, req.body.github);
    return res.json(r);
  })
);

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const r = await githubService.getByUserId(req.user!.sub);
    return res.json(r);
  })
);

export default router;