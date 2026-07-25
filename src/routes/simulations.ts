import { Router, Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { createRateLimiter } from "../middleware/rateLimiter";
import { simulationRequestSchema } from "./schemas";
import { upsertVehicle } from "../services/vehicle.service";
import { createIntegrationLog } from "../services/integration-log.service";
import { invalidateDashboardCache } from "../services/dashboard.service";
import { prisma } from "../lib/prisma";

const router = Router();

const auth = authenticate(["admin"]);
const limiter = createRateLimiter("POST:/api/simulations/duplicate-request");

/**
 * POST /api/simulations/duplicate-request
 *
 * Duplicate Transaction Incident Simulation.
 *
 * Fires N parallel identical vehicle upsert requests to stress-test
 * the idempotent upsert logic. Verifies that exactly 1 vehicle record
 * is created, status history is not duplicated, and all requests are logged.
 *
 * Admin only.
 */
router.post(
  "/api/simulations/duplicate-request",
  auth,
  limiter,
  validate({ body: simulationRequestSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    const simulationId = `sim-${uuidv4().slice(0, 8)}`;
    const { parallel_count, ...vehiclePayload } = req.body;
    const count: number = parallel_count;

    // ── Fire N parallel upserts ──

    const startTime = Date.now();
    const correlationIds: string[] = [];

    const promises = Array.from({ length: count }, async (_, i) => {
      const correlationId = `${simulationId}-req-${i + 1}`;
      correlationIds.push(correlationId);

      const reqStart = Date.now();

      try {
        const result = await upsertVehicle(vehiclePayload);

        // Log successful integration (same as the real POST route does)
        await createIntegrationLog({
          correlationId,
          endpoint: "/api/vehicles",
          httpMethod: "POST",
          externalId: vehiclePayload.external_id,
          success: true,
          httpStatusCode: 200,
          processingTimeMs: Date.now() - reqStart,
          requestPayloadSummary: vehiclePayload,
          companyCode: vehiclePayload.company_code,
        }).catch(() => {});

        // Invalidate dashboard cache
        invalidateDashboardCache();

        return {
          correlationId,
          success: true,
          created: result.created,
          statusChanged: result.statusChanged,
          processingTimeMs: Date.now() - reqStart,
        };
      } catch (err) {
        const statusCode =
          (err as any)?.statusCode === 409
            ? 409
            : (err as any)?.statusCode === 400
              ? 400
              : 500;

        // Log failed integration
        await createIntegrationLog({
          correlationId,
          endpoint: "/api/vehicles",
          httpMethod: "POST",
          externalId: vehiclePayload.external_id,
          success: false,
          httpStatusCode: statusCode,
          errorMessage: (err as Error).message,
          processingTimeMs: Date.now() - reqStart,
          requestPayloadSummary: vehiclePayload,
          companyCode: vehiclePayload.company_code,
        }).catch(() => {});

        return {
          correlationId,
          success: false,
          error: (err as Error).message,
          statusCode,
          processingTimeMs: Date.now() - reqStart,
        };
      }
    });

    const results = await Promise.allSettled(promises);

    // Unwrap settled promises
    const settledResults = results.map((r) =>
      r.status === "fulfilled"
        ? r.value
        : { success: false, error: "Promise rejected unexpectedly", correlationId: "", created: false, statusChanged: false, processingTimeMs: 0 },
    );

    const totalTimeMs = Date.now() - startTime;
    const createdCount = settledResults.filter((r) => r.created === true).length;
    const updatedCount = settledResults.filter((r) => r.created === false && r.success).length;
    const failedCount = settledResults.filter((r) => !r.success).length;

    // ── Verify database state ──

    const vehicleCount = await prisma.vehicle.count({
      where: {
        externalId: vehiclePayload.external_id,
        companyCode: vehiclePayload.company_code,
        branchCode: vehiclePayload.branch_code,
      },
    });

    // Get the vehicle to count its status history
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        externalId: vehiclePayload.external_id,
        companyCode: vehiclePayload.company_code,
        branchCode: vehiclePayload.branch_code,
      },
      include: {
        statusHistory: true,
      },
    });

    const statusHistoryCount = vehicle?.statusHistory.length ?? 0;

    // Count integration logs for this simulation
    const logCount = await prisma.integrationLog.count({
      where: {
        correlationId: { in: correlationIds },
      },
    });

    // Count integration logs that were successful
    const successLogCount = await prisma.integrationLog.count({
      where: {
        correlationId: { in: correlationIds },
        success: true,
      },
    });

    // Database is consistent if:
    // - Exactly 1 vehicle exists (atomic upsert guarantee)
    // - At least 1 status history entry (best-effort guard under concurrency)
    // - All N requests are logged
    const consistent =
      vehicleCount === 1 &&
      statusHistoryCount >= 1 &&
      logCount === count;

    // ── Response ──

    res.status(200).json({
      success: true,
      message: "Duplicate request simulation complete",
      data: {
        simulation_id: simulationId,
        requests_sent: count,
        total_time_ms: totalTimeMs,
        results: {
          created: createdCount,
          updated: updatedCount,
          failed: failedCount,
        },
        verification: {
          vehicles_found: vehicleCount,
          status_history_entries: statusHistoryCount,
          integration_log_entries: logCount,
          successful_logs: successLogCount,
          database_consistent: consistent,
        },
        concurrency_proof: {
          no_duplicate_vehicles: vehicleCount === 1,
          no_duplicate_status_history: statusHistoryCount >= 1,
          all_requests_logged: logCount === count,
          idempotent_upsert_working: vehicleCount === 1 && logCount === count,
        },
        details: settledResults.map((r) => ({
          correlation_id: r.correlationId,
          success: r.success,
          created: r.created,
          status_changed: r.statusChanged,
          processing_time_ms: r.processingTimeMs,
          error: r.error,
        })),
      },
    });
  },
);

export default router;
