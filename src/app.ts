import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import { correlationId } from "./middleware/correlationId";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import { requireJson } from "./middleware/contentType";
import { querySizeLimit } from "./middleware/requestSize";
import healthRouter from "./routes/health";
import vehiclesRouter from "./routes/vehicles";
import dashboardRouter from "./routes/dashboard";
import integrationLogsRouter from "./routes/integration-logs";
import simulationsRouter from "./routes/simulations";

const app = express();

// ---- Global middleware ----

app.use(cors());
app.use(express.json({ limit: "1mb" })); // Phase 5: enforce body size limit
app.use(correlationId);
app.use(requestLogger);
app.use(querySizeLimit(2048)); // Phase 5: limit query string to 2KB
app.use(requireJson); // Phase 5: enforce application/json on write methods

// ---- Swagger / OpenAPI docs (public) ----

// Patch the server URL based on SWAGGER_URL env var (evaluated at request time)
function getSpec() {
  return {
    ...swaggerSpec,
    servers: [
      {
        url: process.env.SWAGGER_URL || `http://localhost:${process.env.PORT || 6300}`,
        description: process.env.SWAGGER_URL ? "Production server" : "Development server",
      },
    ],
  };
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(getSpec(), {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Vehicle Stock API — Docs",
  
}));
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(getSpec());
});

// ---- Routes ----

// Public
app.use(healthRouter);

// Protected — auth and rate limiting are applied per-route inside each router
app.use(vehiclesRouter);
app.use(dashboardRouter);
app.use(integrationLogsRouter);
app.use(simulationsRouter);

// ---- Error handling (must be last) ----

app.use(errorHandler);

export default app;
