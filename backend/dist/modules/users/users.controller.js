"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const users_service_1 = require("./users.service");
const audit_1 = require("../../middleware/audit");
exports.usersController = {
    async profile(req, res) {
        const user = await users_service_1.usersService.getProfile(req.user.sub);
        return res.json(user);
    },
    async updateProfile(req, res) {
        const user = await users_service_1.usersService.updateProfile(req.user.sub, req.body);
        await (0, audit_1.auditLog)(req, "UPDATE_PROFILE", "User");
        return res.json(user);
    },
    async exportData(req, res) {
        const data = await users_service_1.usersService.exportData(req.user.sub);
        await (0, audit_1.auditLog)(req, "EXPORT_DATA_LGPD", "User");
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=meus-dados.json");
        return res.send(JSON.stringify(data, null, 2));
    },
    async deleteAccount(req, res) {
        await (0, audit_1.auditLog)(req, "DELETE_ACCOUNT_LGPD", "User", { userId: req.user.sub });
        await users_service_1.usersService.deleteAccount(req.user.sub);
        return res.status(204).send();
    },
};
//# sourceMappingURL=users.controller.js.map