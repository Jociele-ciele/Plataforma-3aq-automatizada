import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middleware/error-handler";
import { generalLimiter } from "./middleware/rate-limit";

import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import jobsRoutes from "./modules/jobs/jobs.routes";
import resumesRoutes from "./modules/resumes/resumes.routes";
import challengesRoutes from "./modules/challenges/challenges.routes";
import applicationsRoutes from "./modules/applications/applications.routes";
import githubRoutes from "./modules/github/github.routes";
import rankingRoutes from "./modules/ranking/ranking.routes";

export function createApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    })
  );
  app.use(cors({
    origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    credentials: true,
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  if (env.NODE_ENV !== "test") app.use(morgan("dev"));
  app.use(generalLimiter);

  app.get("/api/health", (_req, res) =>
    res.json({ ok: true, service: "3aq-talent-backend", env: env.NODE_ENV })
  );

  app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "3aq Talent API",
      swaggerOptions: { persistAuthorization: true },
    })
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/jobs", jobsRoutes);
  app.use("/api/resumes", resumesRoutes);
  app.use("/api/challenges", challengesRoutes);
  app.use("/api/applications", applicationsRoutes);
  app.use("/api/github", githubRoutes);
  app.use("/api/ranking", rankingRoutes);

  app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada" }));
  app.use(errorHandler);

  return app;
}
