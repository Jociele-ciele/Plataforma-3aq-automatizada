"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const fs_1 = require("fs");
const config_js_1 = require("./config.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const vagas_js_1 = __importDefault(require("./routes/vagas.js"));
const candidaturas_js_1 = __importDefault(require("./routes/candidaturas.js"));
const candidatos_js_1 = __importDefault(require("./routes/candidatos.js"));
const submissoes_js_1 = __importDefault(require("./routes/submissoes.js"));
const github_js_1 = __importDefault(require("./routes/github.js"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json({ limit: "1mb" }));
app.get("/health", (_req, res) => {
    res.json({ status: "ok", servico: "talent-api" });
});
app.use("/auth", auth_js_1.default);
app.use("/vagas", vagas_js_1.default);
app.use("/candidaturas", candidaturas_js_1.default);
app.use("/candidatos", candidatos_js_1.default);
app.use("/submissoes", submissoes_js_1.default);
app.use("/github", github_js_1.default);
app.use((_req, res) => {
    res.status(404).json({ error: "Não encontrado" });
});
app.use(errorHandler_js_1.errorHandler);
async function bootstrap() {
    await fs_1.promises.mkdir(config_js_1.config.uploadDir, { recursive: true });
    app.listen(config_js_1.config.port, () => {
        console.log(`API escuta em http://localhost:${config_js_1.config.port}`);
    });
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map