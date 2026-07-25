import { Router, Request, Response, NextFunction } from "express";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { createRateLimiter } from "../middleware/rateLimiter";
import { listLogsQuerySchema } from "./schemas";
import { listIntegrationLogs } from "../services/integration-log.service";

const router = Router();

const auth = authenticate(["admin"]);
const logsLimiter = createRateLimiter("GET:/api/integration-logs");

/**
 * GET /api/integration-logs
 * Paginated integration audit log. Admin only.
 */
router.get(
  "/api/integration-logs",
  auth,
  logsLimiter,
  validate({ query: listLogsQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { logs, pagination } = await listIntegrationLogs(
        req.query as any
      );

      res.status(200).json({
        success: true,
        message: "Integration logs retrieved successfully",
        data: logs,
        pagination,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
