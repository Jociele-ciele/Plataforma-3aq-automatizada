"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const error_handler_1 = require("./middleware/error-handler");
const rate_limit_1 = require("./middleware/rate-limit");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const jobs_routes_1 = __importDefault(require("./modules/jobs/jobs.routes"));
const resumes_routes_1 = __importDefault(require("./modules/resumes/resumes.routes"));
const challenges_routes_1 = __importDefault(require("./modules/challenges/challenges.routes"));
const applications_routes_1 = __importDefault(require("./modules/applications/applications.routes"));
const github_routes_1 = __importDefault(require("./modules/github/github.routes"));
const ranking_routes_1 = __importDefault(require("./modules/ranking/ranking.routes"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({ origin: env_1.env.CORS_ORIGIN, credentials: true }));
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use(express_1.default.urlencoded({ extended: true }));
    if (env_1.env.NODE_ENV !== "test")
        app.use((0, morgan_1.default)("dev"));
    app.use(rate_limit_1.generalLimiter);
    app.get("/api/health", (_req, res) => res.json({ ok: true, service: "3aq-talent-backend", env: env_1.env.NODE_ENV }));
    app.use("/api/auth", auth_routes_1.default);
    app.use("/api/users", users_routes_1.default);
    app.use("/api/jobs", jobs_routes_1.default);
    app.use("/api/resumes", resumes_routes_1.default);
    app.use("/api/challenges", challenges_routes_1.default);
    app.use("/api/applications", applications_routes_1.default);
    app.use("/api/github", github_routes_1.default);
    app.use("/api/ranking", ranking_routes_1.default);
    app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada" }));
    app.use(error_handler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map