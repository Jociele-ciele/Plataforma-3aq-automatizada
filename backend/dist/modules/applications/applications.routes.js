"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const applications_controller_1 = require("./applications.controller");
const auth_1 = require("../../middleware/auth");
const async_handler_1 = require("../../utils/async-handler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/mine", (0, auth_1.authorize)("CANDIDATO"), (0, async_handler_1.asyncHandler)(applications_controller_1.applicationsController.listMine));
router.get("/by-job/:vagaId", (0, auth_1.authorize)("RECRUTADOR"), (0, async_handler_1.asyncHandler)(applications_controller_1.applicationsController.listByJob));
router.get("/:id", (0, async_handler_1.asyncHandler)(applications_controller_1.applicationsController.getById));
router.post("/job/:vagaId", (0, auth_1.authorize)("CANDIDATO"), (0, async_handler_1.asyncHandler)(applications_controller_1.applicationsController.apply));
router.put("/:id/status", (0, auth_1.authorize)("RECRUTADOR"), (0, async_handler_1.asyncHandler)(applications_controller_1.applicationsController.setStatus));
router.post("/:id/refresh-score", (0, async_handler_1.asyncHandler)(applications_controller_1.applicationsController.refreshScore));
exports.default = router;
//# sourceMappingURL=applications.routes.js.map