import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Demo@12345", 10);

  const recruiter = await prisma.user.upsert({
    where: { email: "recrutador@3aq.demo" },
    update: {},
    create: {
      email: "recrutador@3aq.demo",
      passwordHash: hash,
      name: "Equipa RH 3aq",
      role: Role.RECRUITER,
    },
  });

  const candidateUser = await prisma.user.upsert({
    where: { email: "candidato@demo.com" },
    update: {},
    create: {
      email: "candidato@demo.com",
      passwordHash: hash,
      name: "Candidato Demo",
      role: Role.CANDIDATE,
      githubLogin: "octocat",
    },
  });

  const profile = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.id },
    update: {},
    create: {
      userId: candidateUser.id,
      bio: "Desenvolvedor full-stack em formação.",
      cvExtractedText:
        "Experiência em JavaScript, React, Node.js, PostgreSQL. Projetos com REST APIs e testes automatizados.",
    },
  });

  const job = await prisma.job.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      title: "Desenvolvedor Full Stack Júnior",
      description:
        "Vaga para integrar equipa de produtos internos. Valorizamos Javascript/Typescript e boas práticas.",
      stack: ["javascript", "react", "node", "postgresql"],
      criteria: {
        weights: { cvKeywords: 0.2, github: 0.2, technicalTest: 0.6 },
      },
      isOpen: true,
      recruiterId: recruiter.id,
      challenges: {
        create: {
          title: "Soma de pares no array",
          description:
            'Implemente a função solution que recebe um array de números e devolve a soma apenas dos elementos pares. Ex.: solution([1,2,3,4]) => 6',
          language: "javascript",
          starterCode: `function solution(nums) {
  // TODO
}`,
          testCases: [
            { input: [1, 2, 3, 4], expected: 6 },
            { input: [0], expected: 0 },
            { input: [1, 3, 5], expected: 0 },
            { input: [2, 4, 6], expected: 12 },
          ],
          timeLimitMs: 3000,
        },
      },
    },
  });

  await prisma.application.upsert({
    where: {
      jobId_candidateId: { jobId: job.id, candidateId: profile.id },
    },
    update: {},
    create: {
      jobId: job.id,
      candidateId: profile.id,
      status: "SUBMITTED",
    },
  });

  console.log("Seed concluído.", { recruiter: recruiter.email, candidate: candidateUser.email });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
