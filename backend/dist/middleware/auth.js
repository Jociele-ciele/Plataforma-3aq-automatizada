"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
function authenticate(req, _res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        throw new errors_1.UnauthorizedError("Token não enviado");
    }
    const token = header.slice("Bearer ".length).trim();
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch {
        throw new errors_1.UnauthorizedError("Token inválido ou expirado");
    }
}
function authorize(...roles) {
    return (req, _res, next) => {
        if (!req.user)
            throw new errors_1.UnauthorizedError();
        if (!roles.includes(req.user.role)) {
            throw new errors_1.ForbiddenError("Você não tem permissão para acessar este recurso");
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map