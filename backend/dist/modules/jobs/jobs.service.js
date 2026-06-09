"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsService = void 0;
const prisma_1 = require("../../config/prisma");
const errors_1 = require("../../utils/errors");
exports.jobsService = {
    async list(filtro) {
        return prisma_1.prisma.job.findMany({
            where: {
                status: filtro?.status,
                OR: filtro?.q
                    ? [
                        { titulo: { contains: filtro.q, mode: "insensitive" } },
                        { descricao: { contains: filtro.q, mode: "insensitive" } },
                    ]
                    : undefined,
            },
            include: {
                recrutador: { select: { id: true, nome: true } },
                _count: { select: { applications: true, challenges: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    },
    async getById(id) {
        const job = await prisma_1.prisma.job.findUnique({
            where: { id },
            include: {
                recrutador: { select: { id: true, nome: true, email: true } },
                challenges: true,
                _count: { select: { applications: true } },
            },
        });
        if (!job)
            throw new errors_1.NotFoundError("Vaga não encontrada");
        return job;
    },
    async create(recrutadorId, data) {
        return prisma_1.prisma.job.create({
            data: { ...data, recrutadorId },
        });
    },
    async update(jobId, recrutadorId, data) {
        const job = await prisma_1.prisma.job.findUnique({ where: { id: jobId } });
        if (!job)
            throw new errors_1.NotFoundError("Vaga não encontrada");
        if (job.recrutadorId !== recrutadorId) {
            throw new errors_1.ForbiddenError("Esta vaga não é sua");
        }
        return prisma_1.prisma.job.update({ where: { id: jobId }, data });
    },
    async close(jobId, recrutadorId) {
        return this.update(jobId, recrutadorId, { status: "ENCERRADA" });
    },
    async remove(jobId, recrutadorId) {
        const job = await prisma_1.prisma.job.findUnique({ where: { id: jobId } });
        if (!job)
            throw new errors_1.NotFoundError("Vaga não encontrada");
        if (job.recrutadorId !== recrutadorId)
            throw new errors_1.ForbiddenError();
        await prisma_1.prisma.job.delete({ where: { id: jobId } });
    },
    async myJobs(recrutadorId) {
        return prisma_1.prisma.job.findMany({
            where: { recrutadorId },
            include: { _count: { select: { applications: true, challenges: true } } },
            orderBy: { createdAt: "desc" },
        });
    },
};
//# sourceMappingURL=jobs.service.js.map