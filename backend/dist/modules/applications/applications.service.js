"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationsService = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../../config/prisma");
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
const github_service_1 = require("../github/github.service");
exports.applicationsService = {
    async apply(candidatoId, vagaId) {
        const vaga = await prisma_1.prisma.job.findUnique({ where: { id: vagaId } });
        if (!vaga)
            throw new errors_1.NotFoundError("Vaga não encontrada");
        if (vaga.status !== "ABERTA")
            throw new errors_1.AppError("Esta vaga não está mais aberta", 400);
        const jaInscrito = await prisma_1.prisma.application.findUnique({
            where: { candidatoId_vagaId: { candidatoId, vagaId } },
        });
        if (jaInscrito)
            throw new errors_1.AppError("Você já se inscreveu nesta vaga", 409);
        // Currículo mais recente
        const resume = await prisma_1.prisma.resume.findFirst({
            where: { candidatoId },
            orderBy: { createdAt: "desc" },
        });
        let scoreCurriculo = 0;
        let resumoIA = null;
        if (resume) {
            try {
                const { data } = await axios_1.default.post(`${env_1.env.AI_SERVICE_URL}/triagem`, {
                    texto: resume.textoExtraido,
                    tecnologias: vaga.tecnologias,
                    tituloVaga: vaga.titulo,
                    descricao: vaga.descricao,
                });
                scoreCurriculo = Math.round(data.scoreAderencia);
                resumoIA = data.resumo;
            }
            catch (e) {
                console.warn("[IA] indisponível, usando fallback simples:", e.message);
                scoreCurriculo = fallbackScore(resume.textoExtraido, vaga.tecnologias);
                resumoIA = "Análise simplificada (serviço de IA indisponível)";
            }
        }
        // GitHub
        const user = await prisma_1.prisma.user.findUnique({ where: { id: candidatoId } });
        let scoreGithub = 0;
        if (user?.github) {
            try {
                const analise = await github_service_1.githubService.analisarUsuario(candidatoId, user.github);
                scoreGithub = analise.score;
            }
            catch (e) {
                console.warn("[GitHub] erro ao analisar:", e.message);
            }
        }
        return prisma_1.prisma.application.create({
            data: {
                candidatoId,
                vagaId,
                scoreCurriculo,
                scoreGithub,
                scoreDesafios: 0,
                notaFinal: Math.round(scoreCurriculo * 0.3 + scoreGithub * 0.2),
                resumoIA,
                status: "EM_ANALISE",
            },
            include: { vaga: true },
        });
    },
    async listMine(candidatoId) {
        return prisma_1.prisma.application.findMany({
            where: { candidatoId },
            include: {
                vaga: { select: { id: true, titulo: true, tecnologias: true, status: true } },
                submissions: { include: { challenge: { select: { tipo: true, peso: true } } } },
            },
            orderBy: { createdAt: "desc" },
        });
    },
    async listByJob(vagaId, recrutadorId) {
        const vaga = await prisma_1.prisma.job.findUnique({ where: { id: vagaId } });
        if (!vaga)
            throw new errors_1.NotFoundError("Vaga não encontrada");
        if (vaga.recrutadorId !== recrutadorId)
            throw new errors_1.AppError("Sem permissão", 403);
        return prisma_1.prisma.application.findMany({
            where: { vagaId },
            include: {
                candidato: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        github: true,
                        githubAnalysis: true,
                        avatar: true,
                    },
                },
                submissions: { include: { challenge: { select: { tipo: true, peso: true } } } },
            },
            orderBy: { notaFinal: "desc" },
        });
    },
    async atualizarNotaFinal(applicationId) {
        const app = await prisma_1.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                submissions: { include: { challenge: { select: { peso: true } } } },
            },
        });
        if (!app)
            throw new errors_1.NotFoundError();
        const totalPesos = app.submissions.reduce((acc, s) => acc + (s.challenge.peso ?? 1), 0) || 1;
        const somaPond = app.submissions.reduce((acc, s) => acc + s.nota * (s.challenge.peso ?? 1), 0);
        const scoreDesafios = somaPond / totalPesos;
        const notaFinal = Math.round(app.scoreCurriculo * 0.3 + app.scoreGithub * 0.2 + scoreDesafios * 0.5);
        return prisma_1.prisma.application.update({
            where: { id: applicationId },
            data: { scoreDesafios, notaFinal },
        });
    },
    async setStatus(applicationId, recrutadorId, status, feedback) {
        const app = await prisma_1.prisma.application.findUnique({
            where: { id: applicationId },
            include: { vaga: true },
        });
        if (!app)
            throw new errors_1.NotFoundError();
        if (app.vaga.recrutadorId !== recrutadorId)
            throw new errors_1.AppError("Sem permissão", 403);
        return prisma_1.prisma.application.update({
            where: { id: applicationId },
            data: { status, feedback },
        });
    },
    async getById(applicationId, userId, role) {
        const app = await prisma_1.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                vaga: { include: { recrutador: { select: { id: true, nome: true } } } },
                candidato: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        github: true,
                        githubAnalysis: true,
                    },
                },
                submissions: { include: { challenge: true } },
            },
        });
        if (!app)
            throw new errors_1.NotFoundError();
        const podeVer = (role === "CANDIDATO" && app.candidatoId === userId) ||
            (role === "RECRUTADOR" && app.vaga.recrutadorId === userId);
        if (!podeVer)
            throw new errors_1.AppError("Sem permissão", 403);
        return app;
    },
};
// fallback simples caso o serviço de IA esteja fora do ar
function fallbackScore(texto, tecnologias) {
    const textoLower = texto.toLowerCase();
    let encontradas = 0;
    for (const tec of tecnologias) {
        if (textoLower.includes(tec.toLowerCase()))
            encontradas++;
    }
    return Math.round((encontradas / Math.max(tecnologias.length, 1)) * 100);
}
//# sourceMappingURL=applications.service.js.map