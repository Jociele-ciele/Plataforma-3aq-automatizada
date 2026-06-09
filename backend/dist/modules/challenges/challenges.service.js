"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.challengesService = void 0;
const prisma_1 = require("../../config/prisma");
const errors_1 = require("../../utils/errors");
const sandbox_1 = require("./sandbox");
exports.challengesService = {
    async create(recrutadorId, data) {
        const vaga = await prisma_1.prisma.job.findUnique({
            where: { id: data.vagaId },
            include: { _count: { select: { challenges: true } } },
        });
        if (!vaga)
            throw new errors_1.NotFoundError("Vaga não encontrada");
        if (vaga.recrutadorId !== recrutadorId)
            throw new errors_1.AppError("Esta vaga não é sua", 403);
        if (vaga._count.challenges >= 5) {
            throw new errors_1.AppError("Cada vaga pode ter no máximo 5 desafios", 400);
        }
        return prisma_1.prisma.challenge.create({
            data: {
                vagaId: data.vagaId,
                tipo: data.tipo,
                enunciado: data.enunciado,
                peso: data.peso,
                alternativas: data.alternativas,
                respostaCorreta: data.respostaCorreta ?? null,
                exemplos: data.exemplos,
                casosTeste: data.casosTeste,
            },
        });
    },
    async listByJob(vagaId, paraCandidato) {
        const challenges = await prisma_1.prisma.challenge.findMany({ where: { vagaId } });
        if (paraCandidato) {
            return challenges.map(({ respostaCorreta, casosTeste, ...rest }) => ({
                ...rest,
                // mostra só os 2 primeiros casos como exemplo
                casosTesteExemplo: Array.isArray(casosTeste) ? casosTeste.slice(0, 2) : [],
            }));
        }
        return challenges;
    },
    async getById(id) {
        const c = await prisma_1.prisma.challenge.findUnique({ where: { id } });
        if (!c)
            throw new errors_1.NotFoundError("Desafio não encontrado");
        return c;
    },
    async submit(candidatoId, challengeId, data) {
        const challenge = await prisma_1.prisma.challenge.findUnique({ where: { id: challengeId } });
        if (!challenge)
            throw new errors_1.NotFoundError("Desafio não encontrado");
        let nota = 0;
        let detalhes = null;
        if (challenge.tipo === "MULTIPLA_ESCOLHA") {
            if (!data.resposta)
                throw new errors_1.AppError("Informe a alternativa marcada", 400);
            nota = data.resposta === challenge.respostaCorreta ? 100 : 0;
            detalhes = {
                marcada: data.resposta,
                correta: challenge.respostaCorreta,
                acertou: nota === 100,
            };
        }
        else {
            if (!data.codigo)
                throw new errors_1.AppError("Envie o código JavaScript", 400);
            const casos = challenge.casosTeste ?? [];
            const resultado = (0, sandbox_1.rodarCodigo)(data.codigo, casos);
            nota = resultado.nota;
            detalhes = resultado;
        }
        return prisma_1.prisma.submission.create({
            data: {
                challengeId,
                candidatoId,
                applicationId: data.applicationId ?? null,
                codigo: data.codigo,
                resposta: data.resposta,
                nota,
                detalhes: detalhes,
            },
        });
    },
    async remove(challengeId, recrutadorId) {
        const challenge = await prisma_1.prisma.challenge.findUnique({
            where: { id: challengeId },
            include: { vaga: true },
        });
        if (!challenge)
            throw new errors_1.NotFoundError();
        if (challenge.vaga.recrutadorId !== recrutadorId)
            throw new errors_1.AppError("Sem permissão", 403);
        await prisma_1.prisma.challenge.delete({ where: { id: challengeId } });
    },
};
//# sourceMappingURL=challenges.service.js.map