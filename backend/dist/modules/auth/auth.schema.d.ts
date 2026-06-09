import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    nome: z.ZodString;
    email: z.ZodString;
    senha: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["CANDIDATO", "RECRUTADOR"]>>;
    github: z.ZodOptional<z.ZodString>;
    aceitouLGPD: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    nome: string;
    email: string;
    senha: string;
    role: "CANDIDATO" | "RECRUTADOR";
    aceitouLGPD: true;
    github?: string | undefined;
}, {
    nome: string;
    email: string;
    senha: string;
    aceitouLGPD: true;
    role?: "CANDIDATO" | "RECRUTADOR" | undefined;
    github?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    senha: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    senha: string;
}, {
    email: string;
    senha: string;
}>;
export declare const refreshSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
//# sourceMappingURL=auth.schema.d.ts.map