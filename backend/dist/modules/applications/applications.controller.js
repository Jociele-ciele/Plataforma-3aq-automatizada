"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationsController = void 0;
const zod_1 = require("zod");
const applications_service_1 = require("./applications.service");
const audit_1 = require("../../middleware/audit");
const statusSchema = zod_1.z.object({
    status: zod_1.z.enum(["APROVADO", "REPROVADO", "EM_ANALISE"]),
    feedback: zod_1.z.string().optional(),
});
exports.applicationsController = {
    async apply(req, res) {
        const app = await applications_service_1.applicationsService.apply(req.user.sub, req.params.vagaId);
        await (0, audit_1.auditLog)(req, "APPLY_JOB", "Application", { id: app.id });
        return res.status(201).json(app);
    },
    async listMine(req, res) {
        return res.json(await applications_service_1.applicationsService.listMine(req.user.sub));
    },
    async listByJob(req, res) {
        return res.json(await applications_service_1.applicationsService.listByJob(req.params.vagaId, req.user.sub));
    },
    async getById(req, res) {
        return res.json(await applications_service_1.applicationsService.getById(req.params.id, req.user.sub, req.user.role));
    },
    async setStatus(req, res) {
        const data = statusSchema.parse(req.body);
        const r = await applications_service_1.applicationsService.setStatus(req.params.id, req.user.sub, data.status, data.feedback);
        await (0, audit_1.auditLog)(req, "SET_STATUS", "Application", { id: r.id, status: r.status });
        return res.json(r);
    },
    async refreshScore(req, res) {
        return res.json(await applications_service_1.applicationsService.atualizarNotaFinal(req.params.id));
    },
};
//# sourceMappingURL=applications.controller.js.map