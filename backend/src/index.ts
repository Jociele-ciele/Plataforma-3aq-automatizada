import express from "express";
import cors from "cors";
import helmet from "helmet";
import { promises as fs } from "fs";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import vagasRoutes from "./routes/vagas.js";
import candidaturasRoutes from "./routes/candidaturas.js";
import candidatosRoutes from "./routes/candidatos.js";
import submissoesRoutes from "./routes/submissoes.js";
import githubRoutes from "./routes/github.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", servico: "talent-api" });
});

app.use("/auth", authRoutes);
app.use("/vagas", vagasRoutes);
app.use("/candidaturas", candidaturasRoutes);
app.use("/candidatos", candidatosRoutes);
app.use("/submissoes", submissoesRoutes);
app.use("/github", githubRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Não encontrado" });
});

app.use(errorHandler);

async function bootstrap() {
  await fs.mkdir(config.uploadDir, { recursive: true });

  app.listen(config.port, () => {
    console.log(`API escuta em http://localhost:${config.port}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
