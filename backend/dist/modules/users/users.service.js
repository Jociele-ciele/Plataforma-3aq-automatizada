"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const prisma_1 = require("../../config/prisma");
const errors_1 = require("../../utils/errors");
exports.usersService = {
    async getProfile(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nome: true,
                email: true,
                role: true,
                github: true,
                bio: true,
                avatar: true,
                aceitouLGPD: true,
                createdAt: true,
                githubAnalysis: true,
                resumes: { select: { id: true, nomeArquivo: true, createdAt: true } },
            },
        });
        if (!user)
            throw new errors_1.NotFoundError("Usuário não encontrado");
        return user;
    },
    async updateProfile(userId, data) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data,
            select: { id: true, nome: true, bio: true, github: true },
        });
    },
    async exportData(userId) {
        // LGPD: o usuário pode baixar tudo que temos sobre ele.
        return prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                resumes: true,
                applications: { include: { vaga: true, submissions: true } },
                submissions: true,
                githubAnalysis: true,
                auditLogs: true,
            },
        });
    },
    async deleteAccount(userId) {
        // Cascade configurado no schema apaga tudo relacionado.
        await prisma_1.prisma.user.delete({ where: { id: userId } });
    },
};
//# sourceMappingURL=users.service.js.map