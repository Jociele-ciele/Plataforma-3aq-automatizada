"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobs_controller_1 = require("./jobs.controller");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const async_handler_1 = require("../../utils/async-handler");
const jobs_schema_1 = require("./jobs.schema");
const router = (0, express_1.Router)();
router.get("/", (0, async_handler_1.asyncHandler)(jobs_controller_1.jobsController.list));
router.get("/mine", auth_1.authenticate, (0, auth_1.authorize)("RECRUTADOR"), (0, async_handler_1.asyncHandler)(jobs_controller_1.jobsController.listMine));
router.get("/:id", (0, async_handler_1.asyncHandler)(jobs_controller_1.jobsController.getById));
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("RECRUTADOR"), (0, validate_1.validate)(jobs_schema_1.createJobSchema), (0, async_handler_1.asyncHandler)(jobs_controller_1.jobsController.create));
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("RECRUTADOR"), (0, validate_1.validate)(jobs_schema_1.updateJobSchema), (0, async_handler_1.asyncHandler)(jobs_controller_1.jobsController.update));
router.post("/:id/close", auth_1.authenticate, (0, auth_1.authorize)("RECRUTADOR"), (0, async_handler_1.asyncHandler)(jobs_controller_1.jobsController.close));
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("RECRUTADOR"), (0, async_handler_1.asyncHandler)(jobs_controller_1.jobsController.remove));
exports.default = router;
//# sourceMappingURL=jobs.routes.js.map