import { z } from "zod";

export const createJobSchema = z.object({
  titulo: z.string().min(3).max(120),
  descricao: z.string().min(10),
  tecnologias: z.array(z.string()).min(1, "Informe pelo menos uma tecnologia"),
  senioridade: z.enum(["JUNIOR", "PLENO", "SENIOR"]).default("PLENO"),
  status: z.enum(["ABERTA", "ENCERRADA", "RASCUNHO"]).default("ABERTA"),
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobDTO = z.infer<typeof createJobSchema>;
export type UpdateJobDTO = z.infer<typeof updateJobSchema>;
