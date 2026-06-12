-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CANDIDATO', 'RECRUTADOR');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ABERTA', 'ENCERRADA', 'RASCUNHO');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('INSCRITO', 'EM_ANALISE', 'APROVADO', 'REPROVADO');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('MULTIPLA_ESCOLHA', 'CODIGO_JS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CANDIDATO',
    "github" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "aceitouLGPD" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tecnologias" TEXT[],
    "senioridade" TEXT NOT NULL DEFAULT 'PLENO',
    "status" "JobStatus" NOT NULL DEFAULT 'ABERTA',
    "recrutadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "candidatoId" TEXT NOT NULL,
    "arquivo" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "textoExtraido" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "candidatoId" TEXT NOT NULL,
    "vagaId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'INSCRITO',
    "notaFinal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreCurriculo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreGithub" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scoreDesafios" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "resumoIA" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "vagaId" TEXT NOT NULL,
    "tipo" "ChallengeType" NOT NULL,
    "enunciado" TEXT NOT NULL,
    "alternativas" JSONB,
    "respostaCorreta" TEXT,
    "exemplos" JSONB,
    "casosTeste" JSONB,
    "peso" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "candidatoId" TEXT NOT NULL,
    "applicationId" TEXT,
    "codigo" TEXT,
    "resposta" TEXT,
    "nota" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "detalhes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GithubAnalysis" (
    "id" TEXT NOT NULL,
    "candidatoId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "repositorios" INTEGER NOT NULL,
    "estrelas" INTEGER NOT NULL,
    "seguidores" INTEGER NOT NULL,
    "tecnologias" TEXT[],
    "ultimaAtividade" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GithubAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT,
    "detalhes" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Application_candidatoId_vagaId_key" ON "Application"("candidatoId", "vagaId");

-- CreateIndex
CREATE UNIQUE INDEX "GithubAnalysis_candidatoId_key" ON "GithubAnalysis"("candidatoId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_recrutadorId_fkey" FOREIGN KEY ("recrutadorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_vagaId_fkey" FOREIGN KEY ("vagaId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GithubAnalysis" ADD CONSTRAINT "GithubAnalysis_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
