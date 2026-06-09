"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const resumes_controller_1 = require("./resumes.controller");
const auth_1 = require("../../middleware/auth");
const async_handler_1 = require("../../utils/async-handler");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)("CANDIDATO"));
router.post("/", upload.single("curriculo"), (0, async_handler_1.asyncHandler)(resumes_controller_1.resumesController.upload));
router.get("/", (0, async_handler_1.asyncHandler)(resumes_controller_1.resumesController.list));
router.get("/last", (0, async_handler_1.asyncHandler)(resumes_controller_1.resumesController.last));
exports.default = router;
//# sourceMappingURL=resumes.routes.js.map