import { z } from "zod";
export declare const createJobSchema: z.ZodObject<{
    titulo: z.ZodString;
    descricao: z.ZodString;
    tecnologias: z.ZodArray<z.ZodString, "many">;
    senioridade: z.ZodDefault<z.ZodEnum<["JUNIOR", "PLENO", "SENIOR"]>>;
    status: z.ZodDefault<z.ZodEnum<["ABERTA", "ENCERRADA", "RASCUNHO"]>>;
}, "strip", z.ZodTypeAny, {
    status: "ABERTA" | "ENCERRADA" | "RASCUNHO";
    titulo: string;
    descricao: string;
    tecnologias: string[];
    senioridade: "JUNIOR" | "PLENO" | "SENIOR";
}, {
    titulo: string;
    descricao: string;
    tecnologias: string[];
    status?: "ABERTA" | "ENCERRADA" | "RASCUNHO" | undefined;
    senioridade?: "JUNIOR" | "PLENO" | "SENIOR" | undefined;
}>;
export declare const updateJobSchema: z.ZodObject<{
    titulo: z.ZodOptional<z.ZodString>;
    descricao: z.ZodOptional<z.ZodString>;
    tecnologias: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    senioridade: z.ZodOptional<z.ZodDefault<z.ZodEnum<["JUNIOR", "PLENO", "SENIOR"]>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["ABERTA", "ENCERRADA", "RASCUNHO"]>>>;
}, "strip", z.ZodTypeAny, {
    status?: "ABERTA" | "ENCERRADA" | "RASCUNHO" | undefined;
    titulo?: string | undefined;
    descricao?: string | undefined;
    tecnologias?: string[] | undefined;
    senioridade?: "JUNIOR" | "PLENO" | "SENIOR" | undefined;
}, {
    status?: "ABERTA" | "ENCERRADA" | "RASCUNHO" | undefined;
    titulo?: string | undefined;
    descricao?: string | undefined;
    tecnologias?: string[] | undefined;
    senioridade?: "JUNIOR" | "PLENO" | "SENIOR" | undefined;
}>;
export type CreateJobDTO = z.infer<typeof createJobSchema>;
export type UpdateJobDTO = z.infer<typeof updateJobSchema>;
//# sourceMappingURL=jobs.schema.d.ts.map