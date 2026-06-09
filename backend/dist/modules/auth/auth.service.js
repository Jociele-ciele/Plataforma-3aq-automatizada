"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../config/prisma");
const jwt_1 = require("../../utils/jwt");
const errors_1 = require("../../utils/errors");
exports.authService = {
    async register(data) {
        const existe = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existe)
            throw new errors_1.AppError("Já existe uma conta com este e-mail", 409);
        const hash = await bcryptjs_1.default.hash(data.senha, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                nome: data.nome,
                email: data.email,
                senha: hash,
                role: data.role,
                github: data.github,
                aceitouLGPD: data.aceitouLGPD,
            },
            select: {
                id: true,
                nome: true,
                email: true,
                role: true,
                github: true,
                aceitouLGPD: true,
                createdAt: true,
            },
        });
        const tokens = await this.gerarTokens(user.id, user.email, user.role);
        return { user, ...tokens };
    },
    async login(data) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
        if (!user || !user.ativo)
            throw new errors_1.UnauthorizedError("E-mail ou senha incorretos");
        const ok = await bcryptjs_1.default.compare(data.senha, user.senha);
        if (!ok)
            throw new errors_1.UnauthorizedError("E-mail ou senha incorretos");
        const tokens = await this.gerarTokens(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role,
                github: user.github,
                avatar: user.avatar,
            },
            ...tokens,
        };
    },
    async refresh(refreshToken) {
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw new errors_1.UnauthorizedError("Refresh token inválido");
        }
        const stored = await prisma_1.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
        if (!stored || stored.expiresAt < new Date()) {
            throw new errors_1.UnauthorizedError("Refresh token expirado");
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user)
            throw new errors_1.UnauthorizedError();
        // rotaciona o refresh token
        await prisma_1.prisma.refreshToken.delete({ where: { id: stored.id } });
        return this.gerarTokens(user.id, user.email, user.role);
    },
    async logout(refreshToken) {
        await prisma_1.prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => null);
    },
    async gerarTokens(userId, email, role) {
        const accessToken = (0, jwt_1.signAccessToken)({ sub: userId, email, role });
        const refreshToken = (0, jwt_1.signRefreshToken)({ sub: userId, email, role });
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
        await prisma_1.prisma.refreshToken.create({
            data: { token: refreshToken, userId, expiresAt },
        });
        return { accessToken, refreshToken };
    },
};
//# sourceMappingURL=auth.service.js.map