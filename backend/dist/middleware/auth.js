"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../config.js");
const db_js_1 = require("../db.js");
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, config_js_1.config.jwtSecret, { expiresIn: "7d" });
}
function authMiddleware(requiredRoles) {
    return async (req, res, next) => {
        const header = req.headers.authorization;
        const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
        if (!token) {
            res.status(401).json({ error: "Token em falta" });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_js_1.config.jwtSecret);
            const user = await db_js_1.prisma.users.findUnique({
                where: { id: decoded.sub },
            });
            if (!user) {
                res.status(401).json({ error: "Utilizador inválido" });
                return;
            }
            if (requiredRoles?.length && !requiredRoles.includes(user.role)) {
                res.status(403).json({ error: "Permissão negada" });
                return;
            }
            req.auth = { userId: user.id, role: user.role };
            next();
        }
        catch {
            res.status(401).json({ error: "Token inválido" });
        }
    };
}
//# sourceMappingURL=auth.js.map