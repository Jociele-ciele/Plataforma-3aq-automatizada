"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
const app = (0, app_1.createApp)();
const server = app.listen(env_1.env.PORT, () => {
    console.log(`\n🚀 3aq Talent API rodando em http://localhost:${env_1.env.PORT}`);
    console.log(`📚 Healthcheck: http://localhost:${env_1.env.PORT}/api/health`);
    console.log(`🌐 CORS liberado para: ${env_1.env.CORS_ORIGIN}\n`);
});
const graceful = async () => {
    console.log("\n🛑 Encerrando…");
    server.close();
    await prisma_1.prisma.$disconnect();
    process.exit(0);
};
process.on("SIGINT", graceful);
process.on("SIGTERM", graceful);
//# sourceMappingURL=server.js.map