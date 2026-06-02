import { prisma } from "../../config/prisma";
import { ForbiddenError, NotFoundError } from "../../utils/errors";
import { CreateJobDTO, UpdateJobDTO } from "./jobs.schema";

export const jobsService = {
  async list(filtro?: { status?: string; q?: string }) {
    return prisma.job.findMany({
      where: {
        status: filtro?.status as never,
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

  async getById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        recrutador: { select: { id: true, nome: true, email: true } },
        challenges: true,
        _count: { select: { applications: true } },
      },
    });
    if (!job) throw new NotFoundError("Vaga não encontrada");
    return job;
  },

  async create(recrutadorId: string, data: CreateJobDTO) {
    return prisma.job.create({
      data: { ...data, recrutadorId },
    });
  },

  async update(jobId: string, recrutadorId: string, data: UpdateJobDTO) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError("Vaga não encontrada");
    if (job.recrutadorId !== recrutadorId) {
      throw new ForbiddenError("Esta vaga não é sua");
    }
    return prisma.job.update({ where: { id: jobId }, data });
  },

  async close(jobId: string, recrutadorId: string) {
    return this.update(jobId, recrutadorId, { status: "ENCERRADA" });
  },

  async remove(jobId: string, recrutadorId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError("Vaga não encontrada");
    if (job.recrutadorId !== recrutadorId) throw new ForbiddenError();
    await prisma.job.delete({ where: { id: jobId } });
  },

  async myJobs(recrutadorId: string) {
    return prisma.job.findMany({
      where: { recrutadorId },
      include: { _count: { select: { applications: true, challenges: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
};
