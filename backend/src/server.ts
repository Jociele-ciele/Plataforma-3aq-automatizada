import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`\n🚀 3aq Talent API rodando em http://localhost:${env.PORT}`);
  console.log(`📚 Healthcheck: http://localhost:${env.PORT}/api/health`);
  console.log(`📖 Swagger:     http://localhost:${env.PORT}/api/docs`);
  console.log(`🌐 CORS liberado para: ${env.CORS_ORIGIN}\n`);
});

const graceful = async () => {
  console.log("\n🛑 Encerrando…");
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", graceful);
process.on("SIGTERM", graceful);
