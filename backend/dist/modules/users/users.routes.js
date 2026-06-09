"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const users_controller_1 = require("./users.controller");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const async_handler_1 = require("../../utils/async-handler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const updateSchema = zod_1.z.object({
    nome: zod_1.z.string().min(2).optional(),
    bio: zod_1.z.string().max(500).optional(),
    github: zod_1.z.string().optional(),
});
router.get("/me", (0, async_handler_1.asyncHandler)(users_controller_1.usersController.profile));
router.put("/me", (0, validate_1.validate)(updateSchema), (0, async_handler_1.asyncHandler)(users_controller_1.usersController.updateProfile));
router.get("/me/export", (0, async_handler_1.asyncHandler)(users_controller_1.usersController.exportData));
router.delete("/me", (0, async_handler_1.asyncHandler)(users_controller_1.usersController.deleteAccount));
exports.default = router;
//# sourceMappingURL=users.routes.js.map