"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
// Wrapper para evitar try/catch em cada controller — repassa erros ao middleware global.
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=async.handler.js.map