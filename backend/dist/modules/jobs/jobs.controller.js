"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsController = void 0;
const jobs_service_1 = require("./jobs.service");
const audit_1 = require("../../middleware/audit");
exports.jobsController = {
    async list(req, res) {
        const { status, q } = req.query;
        return res.json(await jobs_service_1.jobsService.list({ status, q }));
    },
    async listMine(req, res) {
        return res.json(await jobs_service_1.jobsService.myJobs(req.user.sub));
    },
    async getById(req, res) {
        return res.json(await jobs_service_1.jobsService.getById(req.params.id));
    },
    async create(req, res) {
        const job = await jobs_service_1.jobsService.create(req.user.sub, req.body);
        await (0, audit_1.auditLog)(req, "CREATE_JOB", "Job", { jobId: job.id });
        return res.status(201).json(job);
    },
    async update(req, res) {
        const job = await jobs_service_1.jobsService.update(req.params.id, req.user.sub, req.body);
        await (0, audit_1.auditLog)(req, "UPDATE_JOB", "Job", { jobId: job.id });
        return res.json(job);
    },
    async close(req, res) {
        const job = await jobs_service_1.jobsService.close(req.params.id, req.user.sub);
        await (0, audit_1.auditLog)(req, "CLOSE_JOB", "Job", { jobId: job.id });
        return res.json(job);
    },
    async remove(req, res) {
        await jobs_service_1.jobsService.remove(req.params.id, req.user.sub);
        await (0, audit_1.auditLog)(req, "DELETE_JOB", "Job", { jobId: req.params.id });
        return res.status(204).send();
    },
};
//# sourceMappingURL=jobs.controller.js.map