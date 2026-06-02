import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { AppError, UnauthorizedError } from "../../utils/errors";
import { LoginDTO, RegisterDTO } from "./auth.schema";

export const authService = {
  async register(data: RegisterDTO) {
    const existe = await prisma.user.findUnique({ where: { email: data.email } });
    if (existe) throw new AppError("Já existe uma conta com este e-mail", 409);

    const hash = await bcrypt.hash(data.senha, 10);
    const user = await prisma.user.create({
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

  async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.ativo) throw new UnauthorizedError("E-mail ou senha incorretos");

    const ok = await bcrypt.compare(data.senha, user.senha);
    if (!ok) throw new UnauthorizedError("E-mail ou senha incorretos");

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

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Refresh token inválido");
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token expirado");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedError();

    // rotaciona o refresh token
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.gerarTokens(user.id, user.email, user.role);
  },

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => null);
  },

  async gerarTokens(userId: string, email: string, role: "CANDIDATO" | "RECRUTADOR") {
    const accessToken = signAccessToken({ sub: userId, email, role });
    const refreshToken = signRefreshToken({ sub: userId, email, role });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });
    return { accessToken, refreshToken };
  },
};
