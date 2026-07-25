import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../middleware/auth";
import { createRateLimiter } from "../middleware/rateLimiter";
import { getDashboardSummary } from "../services/dashboard.service";
import { createIntegrationLog } from "../services/integration-log.service";

const router = Router();

const auth = authenticate(["ops", "admin"]);
const dashboardLimiter = createRateLimiter("GET:/api/dashboard/summary");

/**
 * GET /api/dashboard/summary
 * Aggregated vehicle stock metrics. Cached for 5 minutes.
 */
router.get(
  "/api/dashboard/summary",
  auth,
  dashboardLimiter,
  async (_req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    try {
      const summary = await getDashboardSummary();

      // Log the GET request for usage analytics
      await createIntegrationLog({
        correlationId: _req.correlationId,
        endpoint: "/api/dashboard/summary",
        httpMethod: "GET",
        success: true,
        httpStatusCode: 200,
        processingTimeMs: Date.now() - start,
      }).catch(() => {});

      res.status(200).json({
        success: true,
        message: "Dashboard summary retrieved successfully",
        data: summary,
      });
    } catch (err) {
      await createIntegrationLog({
        correlationId: _req.correlationId,
        endpoint: "/api/dashboard/summary",
        httpMethod: "GET",
        success: false,
        httpStatusCode: 500,
        errorMessage: (err as Error).message,
        processingTimeMs: Date.now() - start,
      }).catch(() => {});
      next(err);
    }
  }
);

export default router;
