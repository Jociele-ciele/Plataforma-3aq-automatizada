"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_1 = require("../../middleware/validate");
const auth_1 = require("../../middleware/auth");
const rate_limit_1 = require("../../middleware/rate-limit");
const async_handler_1 = require("../../utils/async-handler");
const auth_schema_1 = require("./auth.schema");
const router = (0, express_1.Router)();
router.post("/register", rate_limit_1.authLimiter, (0, validate_1.validate)(auth_schema_1.registerSchema), (0, async_handler_1.asyncHandler)(auth_controller_1.authController.register));
router.post("/login", rate_limit_1.authLimiter, (0, validate_1.validate)(auth_schema_1.loginSchema), (0, async_handler_1.asyncHandler)(auth_controller_1.authController.login));
router.post("/refresh", (0, validate_1.validate)(auth_schema_1.refreshSchema), (0, async_handler_1.asyncHandler)(auth_controller_1.authController.refresh));
router.post("/logout", (0, validate_1.validate)(auth_schema_1.refreshSchema), (0, async_handler_1.asyncHandler)(auth_controller_1.authController.logout));
router.get("/me", auth_1.authenticate, (0, async_handler_1.asyncHandler)(auth_controller_1.authController.me));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map