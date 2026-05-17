"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
function errorHandler(err, _req, res, _next) {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({ error: "Ficheiro demasiado grande (máx. 5 MB)" });
            return;
        }
        res.status(400).json({ error: err.message });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            error: "Dados inválidos",
            details: err.flatten(),
        });
        return;
    }
    if (err instanceof Error) {
        res.status(500).json({ error: err.message });
        return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
}
//# sourceMappingURL=errorHandler.js.map