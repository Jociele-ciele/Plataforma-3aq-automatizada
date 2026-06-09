"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const github_service_1 = require("./github.service");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const async_handler_1 = require("../../utils/async-handler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const schema = zod_1.z.object({ github: zod_1.z.string().min(1) });
router.post("/analisar", (0, validate_1.validate)(schema), (0, async_handler_1.asyncHandler)(async (req, res) => {
    const r = await github_service_1.githubService.analisarUsuario(req.user.sub, req.body.github);
    return res.json(r);
}));
router.get("/me", (0, async_handler_1.asyncHandler)(async (req, res) => {
    const r = await github_service_1.githubService.getByUserId(req.user.sub);
    return res.json(r);
}));
exports.default = router;
//# sourceMappingURL=github.routes.js.map