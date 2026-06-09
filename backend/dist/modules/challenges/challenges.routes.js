"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challenges_controller_1 = require("./challenges.controller");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const async_handler_1 = require("../../utils/async-handler");
const challenges_schema_1 = require("./challenges.schema");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post("/", (0, auth_1.authorize)("RECRUTADOR"), (0, validate_1.validate)(challenges_schema_1.createChallengeSchema), (0, async_handler_1.asyncHandler)(challenges_controller_1.challengesController.create));
router.get("/by-job/:vagaId", (0, async_handler_1.asyncHandler)(challenges_controller_1.challengesController.listByJob));
router.get("/:id", (0, async_handler_1.asyncHandler)(challenges_controller_1.challengesController.getById));
router.post("/:id/submit", (0, auth_1.authorize)("CANDIDATO"), (0, validate_1.validate)(challenges_schema_1.submitChallengeSchema), (0, async_handler_1.asyncHandler)(challenges_controller_1.challengesController.submit));
router.delete("/:id", (0, auth_1.authorize)("RECRUTADOR"), (0, async_handler_1.asyncHandler)(challenges_controller_1.challengesController.remove));
exports.default = router;
//# sourceMappingURL=challenges.routes.js.map