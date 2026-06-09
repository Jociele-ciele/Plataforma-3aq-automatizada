"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJobSchema = exports.createJobSchema = void 0;
const zod_1 = require("zod");
exports.createJobSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(3).max(120),
    descricao: zod_1.z.string().min(10),
    tecnologias: zod_1.z.array(zod_1.z.string()).min(1, "Informe pelo menos uma tecnologia"),
    senioridade: zod_1.z.enum(["JUNIOR", "PLENO", "SENIOR"]).default("PLENO"),
    status: zod_1.z.enum(["ABERTA", "ENCERRADA", "RASCUNHO"]).default("ABERTA"),
});
exports.updateJobSchema = exports.createJobSchema.partial();
//# sourceMappingURL=jobs.schema.js.map