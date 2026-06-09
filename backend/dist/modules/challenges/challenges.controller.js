"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.challengesController = void 0;
const challenges_service_1 = require("./challenges.service");
const audit_1 = require("../../middleware/audit");
exports.challengesController = {
    async create(req, res) {
        const c = await challenges_service_1.challengesService.create(req.user.sub, req.body);
        await (0, audit_1.auditLog)(req, "CREATE_CHALLENGE", "Challenge", { id: c.id });
        return res.status(201).json(c);
    },
    async listByJob(req, res) {
        const paraCandidato = req.user?.role === "CANDIDATO";
        return res.json(await challenges_service_1.challengesService.listByJob(req.params.vagaId, paraCandidato));
    },
    async getById(req, res) {
        const challenge = await challenges_service_1.challengesService.getById(req.params.id);
        if (req.user?.role === "CANDIDATO") {
            const { respostaCorreta, casosTeste, ...rest } = challenge;
            return res.json({
                ...rest,
                casosTesteExemplo: Array.isArray(casosTeste) ? casosTeste.slice(0, 2) : [],
            });
        }
        return res.json(challenge);
    },
    async submit(req, res) {
        const sub = await challenges_service_1.challengesService.submit(req.user.sub, req.params.id, req.body);
        await (0, audit_1.auditLog)(req, "SUBMIT_CHALLENGE", "Submission", { id: sub.id });
        return res.status(201).json(sub);
    },
    async remove(req, res) {
        await challenges_service_1.challengesService.remove(req.params.id, req.user.sub);
        return res.status(204).send();
    },
};
//# sourceMappingURL=challenges.controller.js.map