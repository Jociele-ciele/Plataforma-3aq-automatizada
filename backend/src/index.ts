import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "node:fs/promises";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import jobsRoutes from "./routes/jobs.js";
import applicationsRoutes from "./routes/applications.js";
import candidatesRoutes from "./routes/candidates.js";
import submissionsRoutes from "./routes/submissions.js";
import githubRoutes from "./routes/github.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

await fs.mkdir(config.uploadDir, { recursive: true });

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "talent-api" });
});

app.use("/auth", authRoutes);
app.use("/jobs", jobsRoutes);
app.use("/applications", applicationsRoutes);
app.use("/candidates", candidatesRoutes);
app.use("/submissions", submissionsRoutes);
app.use("/github", githubRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Não encontrado" });
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API escuta em http://localhost:${config.port}`);
});
