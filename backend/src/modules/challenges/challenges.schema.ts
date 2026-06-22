import { z } from "zod";

const alternativaSchema = z.object({
  id: z.string().min(1),
  texto: z.string().min(1),
});

const casoTesteSchema = z.object({
  entrada: z.array(z.unknown()),
  saidaEsperada: z.unknown(),
});

const exemploSchema = z.object({
  entrada: z.unknown(),
  saida: z.unknown(),
});

export const createChallengeSchema = z
  .object({
    vagaId: z.string().min(1, "Informe a vaga"),
    tipo: z.enum(["MULTIPLA_ESCOLHA", "CODIGO_JS"]),
    enunciado: z.string().min(5, "Enunciado muito curto"),
    peso: z.number().int().min(1).max(10).default(1),
    alternativas: z.array(alternativaSchema).optional(),
    respostaCorreta: z.string().optional(),
    exemplos: z.array(exemploSchema).optional(),
    casosTeste: z.array(casoTesteSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === "MULTIPLA_ESCOLHA") {
      if (!data.alternativas?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe pelo menos uma alternativa",
          path: ["alternativas"],
        });
      }
      if (!data.respostaCorreta) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe a resposta correta",
          path: ["respostaCorreta"],
        });
      }
    }

    if (data.tipo === "CODIGO_JS" && !data.casosTeste?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe pelo menos um caso de teste",
        path: ["casosTeste"],
      });
    }
  });

export const submitChallengeSchema = z.object({
  codigo: z.string().optional(),
  resposta: z.string().optional(),
  applicationId: z.string().optional(),
});

export type CreateChallengeDTO = z.infer<typeof createChallengeSchema>;
export type SubmitChallengeDTO = z.infer<typeof submitChallengeSchema>;
