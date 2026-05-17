import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Demo@12345", 10);

  const recrutador = await prisma.users.upsert({
    where: { email: "recrutador@3aq.demo" },
    update: {},
    create: {
      email: "recrutador@3aq.demo",
      senha_hash: hash,
      nome: "Equipa RH 3aq",
      role: Role.RECRUTADOR,
    },
  });

  const candidato = await prisma.users.upsert({
    where: { email: "candidato@demo.com" },
    update: {},
    create: {
      email: "candidato@demo.com",
      senha_hash: hash,
      nome: "Candidato Demo",
      role: Role.CANDIDATO,
      github_login: "octocat",
    },
  });

  const perfil = await prisma.perfis_candidatos.upsert({
    where: { usuario_id: candidato.id },
    update: {},
    create: {
      usuario_id: candidato.id,
      bio: "Desenvolvedor full-stack em formação.",
      texto_extraido_cv:
        "Experiência em JavaScript, React, Node.js, PostgreSQL. Projetos com REST APIs e testes automatizados.",
    },
  });

  const vaga = await prisma.vagas.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      titulo: "Desenvolvedor Full Stack Júnior",
      descricao:
        "Vaga para integrar equipa de produtos internos. Valorizamos Javascript/Typescript e boas práticas.",
      tecnologias: ["javascript", "react", "node", "postgresql"],
      criterios: {
        weights: { cvKeywords: 0.2, github: 0.2, technicalTest: 0.6 },
      },
      aberta: true,
      recrutador_id: recrutador.id,
      desafios: {
        create: {
          titulo: "Soma de pares no array",
          descricao:
            "Implemente a função solution que recebe um array de números e devolve a soma apenas dos elementos pares. Ex.: solution([1,2,3,4]) => 6",
          linguagem: "javascript",
          codigo_inicial: `function solution(nums) {
  // TODO
}`,
          casos_teste: [
            { input: [1, 2, 3, 4], expected: 6 },
            { input: [0], expected: 0 },
            { input: [1, 3, 5], expected: 0 },
            { input: [2, 4, 6], expected: 12 },
          ],
          limite_tempo_ms: 3000,
        },
      },
    },
  });

  await prisma.candidaturas.upsert({
    where: {
      vaga_id_candidato_id: {
        vaga_id: vaga.id,
        candidato_id: perfil.id,
      },
    },
    update: {},
    create: {
      vaga_id: vaga.id,
      candidato_id: perfil.id,
      status: "ENVIADO",
    },
  });

  console.log("Seed concluído.", {
    recrutador: recrutador.email,
    candidato: candidato.email,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
