import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { createRateLimiter } from "../middleware/rateLimiter";

const router = Router();
const healthLimiter = createRateLimiter("GET:/health");

/**
 * GET /health
 * Public health check. Verifies database connectivity and returns system status.
 */
router.get("/health", healthLimiter, async (_req: Request, res: Response) => {
  const start = Date.now();

  let dbStatus: "connected" | "disconnected" = "connected";
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "disconnected";
    overallStatus = "unhealthy";
  }

  const responseTimeMs = Date.now() - start;

  const body = {
    status: overallStatus,
    database: dbStatus,
    version: env.APP_VERSION,
    server_time: new Date().toISOString(),
    response_time_ms: responseTimeMs,
  };

  res.status(overallStatus === "healthy" ? 200 : 503).json(body);
});

export default router;
