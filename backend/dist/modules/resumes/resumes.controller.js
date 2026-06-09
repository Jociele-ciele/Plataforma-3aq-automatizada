"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumesController = void 0;
const resumes_service_1 = require("./resumes.service");
const errors_1 = require("../../utils/errors");
const audit_1 = require("../../middleware/audit");
exports.resumesController = {
    async upload(req, res) {
        if (!req.file)
            throw new errors_1.AppError("Envie um arquivo PDF no campo 'curriculo'", 400);
        if (req.file.mimetype !== "application/pdf") {
            throw new errors_1.AppError("O arquivo precisa ser PDF", 400);
        }
        const r = await resumes_service_1.resumesService.upload(req.user.sub, req.file);
        await (0, audit_1.auditLog)(req, "UPLOAD_RESUME", "Resume", { resumeId: r.id });
        return res.status(201).json(r);
    },
    async list(req, res) {
        return res.json(await resumes_service_1.resumesService.listByUser(req.user.sub));
    },
    async last(req, res) {
        return res.json(await resumes_service_1.resumesService.getLastByUser(req.user.sub));
    },
};
//# sourceMappingURL=resumes.controller.js.map