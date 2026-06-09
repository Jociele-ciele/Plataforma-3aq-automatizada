"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
const audit_1 = require("../../middleware/audit");
exports.authController = {
    async register(req, res) {
        const result = await auth_service_1.authService.register(req.body);
        await (0, audit_1.auditLog)(req, "REGISTER", "User", { userId: result.user.id });
        return res.status(201).json(result);
    },
    async login(req, res) {
        const result = await auth_service_1.authService.login(req.body);
        await (0, audit_1.auditLog)(req, "LOGIN", "User", { userId: result.user.id });
        return res.json(result);
    },
    async refresh(req, res) {
        const tokens = await auth_service_1.authService.refresh(req.body.refreshToken);
        return res.json(tokens);
    },
    async logout(req, res) {
        await auth_service_1.authService.logout(req.body.refreshToken);
        await (0, audit_1.auditLog)(req, "LOGOUT", "User");
        return res.status(204).send();
    },
    async me(req, res) {
        return res.json({ user: req.user });
    },
};
//# sourceMappingURL=auth.controlles.js.map