"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = auditLog;
const prisma_1 = require("../config/prisma");
// Registra ação importante no log de auditoria (LGPD).
async function auditLog(req, acao, entidade, detalhes) {
    try {
        await prisma_1.prisma.auditLog.create({
            data: {
                userId: req.user?.sub ?? null,
                acao,
                entidade,
                detalhes: detalhes,
                ip: req.ip ?? null,
            },
        });
    }
    catch (e) {
        console.error("[AUDIT_LOG] falhou:", e);
    }
}
//# sourceMappingURL=audit.js.map