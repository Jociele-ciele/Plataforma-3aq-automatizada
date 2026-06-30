import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "3aq Talent API",
      version: "1.0.0",
      description:
        "API REST da plataforma 3aq Talent — vagas, currículos, desafios técnicos e triagem com IA.",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Ambiente local",
      },
    ],
    tags: [
      { name: "Health", description: "Verificação de disponibilidade" },
      { name: "Auth", description: "Registro, login e tokens" },
      { name: "Users", description: "Perfil e LGPD" },
      { name: "Jobs", description: "Vagas de emprego" },
      { name: "Resumes", description: "Currículos (PDF)" },
      { name: "Challenges", description: "Desafios técnicos" },
      { name: "Applications", description: "Inscrições em vagas" },
      { name: "GitHub", description: "Análise de perfil GitHub" },
      { name: "Ranking", description: "Rankings e dashboards" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token retornado em POST /api/auth/login",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Mensagem de erro" },
          },
        },
        RegisterBody: {
          type: "object",
          required: ["nome", "email", "senha", "aceitouLGPD"],
          properties: {
            nome: { type: "string", minLength: 2, example: "Maria Silva" },
            email: { type: "string", format: "email", example: "maria@email.com" },
            senha: { type: "string", minLength: 6, example: "123456" },
            role: { type: "string", enum: ["CANDIDATO", "RECRUTADOR"], default: "CANDIDATO" },
            github: { type: "string", example: "https://github.com/maria" },
            aceitouLGPD: { type: "boolean", enum: [true] },
          },
        },
        LoginBody: {
          type: "object",
          required: ["email", "senha"],
          properties: {
            email: { type: "string", format: "email" },
            senha: { type: "string" },
          },
        },
        RefreshBody: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        UpdateProfileBody: {
          type: "object",
          properties: {
            nome: { type: "string", minLength: 2 },
            bio: { type: "string", maxLength: 500 },
            github: { type: "string" },
          },
        },
        CreateJobBody: {
          type: "object",
          required: ["titulo", "descricao", "tecnologias"],
          properties: {
            titulo: { type: "string", minLength: 3, example: "Desenvolvedor Full Stack" },
            descricao: { type: "string", minLength: 10 },
            tecnologias: {
              type: "array",
              items: { type: "string" },
              example: ["Node.js", "React", "PostgreSQL"],
            },
            senioridade: {
              type: "string",
              enum: ["JUNIOR", "PLENO", "SENIOR"],
              default: "PLENO",
            },
            status: {
              type: "string",
              enum: ["ABERTA", "ENCERRADA", "RASCUNHO"],
              default: "ABERTA",
            },
          },
        },
        CreateChallengeBody: {
          type: "object",
          required: ["vagaId", "tipo", "enunciado"],
          properties: {
            vagaId: { type: "string" },
            tipo: { type: "string", enum: ["MULTIPLA_ESCOLHA", "CODIGO_JS"] },
            enunciado: { type: "string", minLength: 5 },
            peso: { type: "integer", minimum: 1, maximum: 10, default: 1 },
            alternativas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  texto: { type: "string" },
                },
              },
            },
            respostaCorreta: { type: "string" },
            exemplos: { type: "array", items: { type: "object" } },
            casosTeste: { type: "array", items: { type: "object" } },
          },
        },
        SubmitChallengeBody: {
          type: "object",
          properties: {
            codigo: { type: "string" },
            resposta: { type: "string" },
            applicationId: { type: "string" },
          },
        },
        ApplicationStatusBody: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["APROVADO", "REPROVADO", "EM_ANALISE"] },
            feedback: { type: "string" },
          },
        },
        GitHubAnalisarBody: {
          type: "object",
          required: ["github"],
          properties: {
            github: { type: "string", example: "octocat" },
          },
        },
      },
    },
  },
  apis: ["./src/docs/openapi.paths.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
