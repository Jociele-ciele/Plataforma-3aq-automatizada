"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
function errorHandler(err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: "Dados inválidos",
            issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        });
    }
    if (err instanceof errors_1.AppError) {
        return res.status(err.status).json({ error: err.message, code: err.code });
    }
    console.error("[ERRO INESPERADO]", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
}
//# sourceMappingURL=error-handler.js.map