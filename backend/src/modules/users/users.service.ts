import { prisma } from "../../config/prisma";
import { NotFoundError } from "../../utils/errors";

export const usersService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
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
    if (!user) throw new NotFoundError("Usuário não encontrado");
    return user;
  },

  async updateProfile(userId: string, data: { nome?: string; bio?: string; github?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, nome: true, bio: true, github: true },
    });
  },

  async exportData(userId: string) {
    // LGPD: o usuário pode baixar tudo que temos sobre ele.
    return prisma.user.findUnique({
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

  async deleteAccount(userId: string) {
    // Cascade configurado no schema apaga tudo relacionado.
    await prisma.user.delete({ where: { id: userId } });
  },
};
