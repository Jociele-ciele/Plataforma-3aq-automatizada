import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed…");

  const hash = await bcrypt.hash("123456", 10);

  // Recrutador
  const recrutador = await prisma.user.upsert({
    where: { email: "recrutador@3aq.com" },
    update: {},
    create: {
      nome: "Ana Recrutadora",
      email: "recrutador@3aq.com",
      senha: hash,
      role: "RECRUTADOR",
      aceitouLGPD: true,
    },
  });

  // Candidato
  const candidato = await prisma.user.upsert({
    where: { email: "candidato@3aq.com" },
    update: {},
    create: {
      nome: "João Candidato",
      email: "candidato@3aq.com",
      senha: hash,
      role: "CANDIDATO",
      github: "octocat",
      bio: "Desenvolvedor full-stack apaixonado por JavaScript e React.",
      aceitouLGPD: true,
    },
  });

  // Vaga 1
  const vaga1 = await prisma.job.upsert({
    where: { id: "seed-vaga-1" },
    update: {},
    create: {
      id: "seed-vaga-1",
      titulo: "Desenvolvedor Full-Stack JavaScript",
      descricao:
        "Procuramos pessoa desenvolvedora para construir aplicações web modernas usando React no frontend e Node.js no backend. Você vai trabalhar com banco PostgreSQL, integrações REST e participar das decisões de arquitetura.",
      tecnologias: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      senioridade: "PLENO",
      status: "ABERTA",
      recrutadorId: recrutador.id,
    },
  });

  // Desafios da vaga 1
  await prisma.challenge.deleteMany({ where: { vagaId: vaga1.id } });

  await prisma.challenge.create({
    data: {
      vagaId: vaga1.id,
      tipo: "MULTIPLA_ESCOLHA",
      enunciado: "Qual o resultado de `typeof null` em JavaScript?",
      alternativas: [
        { id: "a", texto: "'null'" },
        { id: "b", texto: "'undefined'" },
        { id: "c", texto: "'object'" },
        { id: "d", texto: "'number'" },
      ],
      respostaCorreta: "c",
      peso: 1,
    },
  });

  await prisma.challenge.create({
    data: {
      vagaId: vaga1.id,
      tipo: "MULTIPLA_ESCOLHA",
      enunciado:
        "Em React, qual hook é usado para executar efeitos colaterais (como buscar dados em uma API)?",
      alternativas: [
        { id: "a", texto: "useState" },
        { id: "b", texto: "useEffect" },
        { id: "c", texto: "useMemo" },
        { id: "d", texto: "useReducer" },
      ],
      respostaCorreta: "b",
      peso: 1,
    },
  });

  await prisma.challenge.create({
    data: {
      vagaId: vaga1.id,
      tipo: "CODIGO_JS",
      enunciado:
        "Implemente uma função `solve(arr)` que receba um array de números e devolva a SOMA de todos eles.",
      exemplos: [
        { entrada: [[1, 2, 3]], saida: 6 },
        { entrada: [[10, -5, 5]], saida: 10 },
      ],
      casosTeste: [
        { entrada: [[1, 2, 3]], saidaEsperada: 6 },
        { entrada: [[10, -5, 5]], saidaEsperada: 10 },
        { entrada: [[]], saidaEsperada: 0 },
        { entrada: [[100, 200, 300, 400]], saidaEsperada: 1000 },
      ],
      peso: 3,
    },
  });

  await prisma.challenge.create({
    data: {
      vagaId: vaga1.id,
      tipo: "CODIGO_JS",
      enunciado:
        "Implemente `solve(s)` que receba uma string e retorne `true` se ela for um palíndromo (igual de trás para frente), ignorando maiúsculas e minúsculas.",
      exemplos: [
        { entrada: ["arara"], saida: true },
        { entrada: ["banana"], saida: false },
      ],
      casosTeste: [
        { entrada: ["arara"], saidaEsperada: true },
        { entrada: ["Banana"], saidaEsperada: false },
        { entrada: ["Ovo"], saidaEsperada: true },
        { entrada: [""], saidaEsperada: true },
      ],
      peso: 2,
    },
  });

  // Vaga 2
  await prisma.job.upsert({
    where: { id: "seed-vaga-2" },
    update: {},
    create: {
      id: "seed-vaga-2",
      titulo: "Desenvolvedor Backend Node.js Sênior",
      descricao:
        "Vaga focada em arquitetura de sistemas, APIs REST escaláveis, mensageria e boas práticas de segurança.",
      tecnologias: ["Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
      senioridade: "SENIOR",
      status: "ABERTA",
      recrutadorId: recrutador.id,
    },
  });

  // Análise GitHub do candidato
  await prisma.githubAnalysis.upsert({
    where: { candidatoId: candidato.id },
    update: {},
    create: {
      candidatoId: candidato.id,
      username: "octocat",
      score: 78,
      repositorios: 12,
      estrelas: 22,
      seguidores: 18,
      tecnologias: ["JavaScript", "TypeScript", "Python"],
      ultimaAtividade: new Date(),
    },
  });

  console.log(" Seed concluído!");
  console.log("   Login Recrutador: recrutador@3aq.com / 123456");
  console.log("   Login Candidato : candidato@3aq.com / 123456");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
