-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CANDIDATO', 'RECRUTADOR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "github_login" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis_candidatos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "telefone" TEXT,
    "bio" TEXT,
    "caminho_cv" TEXT,
    "tipo_mime_cv" TEXT,
    "texto_extraido_cv" TEXT,
    "nota_tecnica" DOUBLE PRECISION,
    "nota_compatibilidade" DOUBLE PRECISION,
    "ultima_analise_em" TIMESTAMP(3),
    "analise_github_json" JSONB,

    CONSTRAINT "perfis_candidatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vagas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tecnologias" TEXT[],
    "criterios" JSONB,
    "aberta" BOOLEAN NOT NULL DEFAULT true,
    "recrutador_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vagas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidaturas" (
    "id" TEXT NOT NULL,
    "vaga_id" TEXT NOT NULL,
    "candidato_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ENVIADO',
    "candidatura_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desafios" (
    "id" TEXT NOT NULL,
    "vaga_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "linguagem" TEXT NOT NULL DEFAULT 'javascript',
    "codigo_inicial" TEXT NOT NULL,
    "casos_teste" JSONB NOT NULL,
    "limite_tempo_ms" INTEGER NOT NULL DEFAULT 5000,

    CONSTRAINT "desafios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissoes" (
    "id" TEXT NOT NULL,
    "candidatura_id" TEXT NOT NULL,
    "desafio_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "testes_aprovados" INTEGER NOT NULL,
    "total_testes" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "percentual_nota" DOUBLE PRECISION NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key"
ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "perfis_candidatos_usuario_id_key"
ON "perfis_candidatos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidaturas_vaga_id_candidato_id_key"
ON "candidaturas"("vaga_id", "candidato_id");

-- AddForeignKey
ALTER TABLE "perfis_candidatos"
ADD CONSTRAINT "perfis_candidatos_usuario_id_fkey"
FOREIGN KEY ("usuario_id")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagas"
ADD CONSTRAINT "vagas_recrutador_id_fkey"
FOREIGN KEY ("recrutador_id")
REFERENCES "users"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas"
ADD CONSTRAINT "candidaturas_vaga_id_fkey"
FOREIGN KEY ("vaga_id")
REFERENCES "vagas"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidaturas"
ADD CONSTRAINT "candidaturas_candidato_id_fkey"
FOREIGN KEY ("candidato_id")
REFERENCES "perfis_candidatos"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desafios"
ADD CONSTRAINT "desafios_vaga_id_fkey"
FOREIGN KEY ("vaga_id")
REFERENCES "vagas"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissoes"
ADD CONSTRAINT "submissoes_candidatura_id_fkey"
FOREIGN KEY ("candidatura_id")
REFERENCES "candidaturas"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissoes"
ADD CONSTRAINT "submissoes_desafio_id_fkey"
FOREIGN KEY ("desafio_id")
REFERENCES "desafios"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
