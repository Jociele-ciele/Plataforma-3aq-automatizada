"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validate = void 0;
// Valida `body` contra um schema Zod. Substitui `req.body` pela versão validada.
const validate = (schema) => (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
};
exports.validate = validate;
const validateQuery = (schema) => (req, _res, next) => {
    req.query = schema.parse(req.query);
    next();
};
exports.validateQuery = validateQuery;
//# sourceMappingURL=validate%20.js.map