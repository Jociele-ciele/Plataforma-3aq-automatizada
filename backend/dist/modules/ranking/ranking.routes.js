"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ranking_service_1 = require("./ranking.service");
const auth_1 = require("../../middleware/auth");
const async_handler_1 = require("../../utils/async-handler");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/job/:vagaId", (0, auth_1.authorize)("RECRUTADOR"), (0, async_handler_1.asyncHandler)(async (req, res) => {
    return res.json(await ranking_service_1.rankingService.byJob(req.params.vagaId));
}));
router.get("/dashboard/recrutador", (0, auth_1.authorize)("RECRUTADOR"), (0, async_handler_1.asyncHandler)(async (req, res) => {
    return res.json(await ranking_service_1.rankingService.dashboardRecrutador(req.user.sub));
}));
router.get("/dashboard/candidato", (0, auth_1.authorize)("CANDIDATO"), (0, async_handler_1.asyncHandler)(async (req, res) => {
    return res.json(await ranking_service_1.rankingService.dashboardCandidato(req.user.sub));
}));
exports.default = router;
//# sourceMappingURL=ranking.routes.js.map