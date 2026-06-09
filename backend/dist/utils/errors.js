"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.AppError = void 0;
class AppError extends Error {
    status;
    code;
    constructor(message, status = 400, code) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
exports.AppError = AppError;
class UnauthorizedError extends AppError {
    constructor(message = "Não autorizado") {
        super(message, 401, "UNAUTHORIZED");
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = "Acesso negado") {
        super(message, 403, "FORBIDDEN");
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = "Não encontrado") {
        super(message, 404, "NOT_FOUND");
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=errors.js.map