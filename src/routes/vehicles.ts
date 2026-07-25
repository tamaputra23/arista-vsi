import { Router, Request, Response, NextFunction } from "express";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { createRateLimiter } from "../middleware/rateLimiter";
import { createVehicleWithBusinessRules, listVehiclesQuerySchema } from "./schemas";
import * as vehicleService from "../services/vehicle.service";
import { createIntegrationLog } from "../services/integration-log.service";
import { invalidateDashboardCache } from "../services/dashboard.service";

const router = Router();

// All vehicle routes require ops or admin auth
const auth = authenticate(["branch", "ops", "admin"]);

// Rate limiters
const postVehicleLimiter = createRateLimiter("POST:/api/vehicles");
const getVehiclesLimiter = createRateLimiter("GET:/api/vehicles");
const getVehicleDetailLimiter = createRateLimiter("GET:/api/vehicles/detail");

/**
 * POST /api/vehicles
 * Idempotent vehicle data ingestion from branch systems.
 */
router.post(
  "/api/vehicles",
  auth,
  postVehicleLimiter,
  validate({ body: createVehicleWithBusinessRules }),
  async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    try {
      const result = await vehicleService.upsertVehicle(req.body);

      // Invalidate dashboard cache on successful upsert
      invalidateDashboardCache();

      const processingTimeMs = Date.now() - start;

      // Log successful integration
      await createIntegrationLog({
        correlationId: req.correlationId,
        endpoint: "/api/vehicles",
        httpMethod: "POST",
        externalId: req.body.external_id,
        success: true,
        httpStatusCode: 200,
        processingTimeMs,
        requestPayloadSummary: req.body,
        companyCode: req.body.company_code,
      }).catch(() => {}); // fire-and-forget; don't fail the request

      res.status(200).json({
        success: true,
        message: "Vehicle data processed successfully",
        data: {
          external_id: result.vehicle.externalId,
          status: result.vehicle.status,
        },
      });
    } catch (err) {
      const processingTimeMs = Date.now() - start;

      // Log failed integration
      const statusCode =
        (err as any)?.statusCode === 409 ? 409 : (err as any)?.statusCode === 400 ? 400 : 500;
      await createIntegrationLog({
        correlationId: req.correlationId,
        endpoint: "/api/vehicles",
        httpMethod: "POST",
        externalId: req.body?.external_id,
        success: false,
        httpStatusCode: statusCode,
        errorMessage: (err as Error).message,
        processingTimeMs,
        requestPayloadSummary: req.body,
        companyCode: req.body?.company_code,
      }).catch(() => {});

      next(err);
    }
  }
);

/**
 * GET /api/vehicles
 * Paginated list with filtering, search, and sorting.
 */
router.get(
  "/api/vehicles",
  auth,
  getVehiclesLimiter,
  validate({ query: listVehiclesQuerySchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    try {
      const { vehicles, pagination } = await vehicleService.listVehicles(
        req.query as any
      );

      // Log the GET request for usage analytics
      await createIntegrationLog({
        correlationId: req.correlationId,
        endpoint: "/api/vehicles",
        httpMethod: "GET",
        externalId: undefined,
        success: true,
        httpStatusCode: 200,
        processingTimeMs: Date.now() - start,
        requestPayloadSummary: req.query as Record<string, unknown>,
      }).catch(() => {});

      res.status(200).json({
        success: true,
        message: "Vehicles retrieved successfully",
        data: vehicles.map((v) => ({
          external_id: v.externalId,
          company_code: v.companyCode,
          branch_code: v.branchCode,
          brand: v.brand,
          model: v.model,
          year: v.year,
          color: v.color,
          status: v.status,
          updated_at: v.updatedAt.toISOString(),
        })),
        pagination,
      });
    } catch (err) {
      await createIntegrationLog({
        correlationId: req.correlationId,
        endpoint: "/api/vehicles",
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

/**
 * GET /api/vehicles/:external_id
 * Detailed view of a single vehicle including status history.
 */
router.get(
  "/api/vehicles/:external_id",
  auth,
  getVehicleDetailLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vehicle = await vehicleService.getVehicleByExternalId(
        req.params.external_id as string
      );

      res.status(200).json({
        success: true,
        message: "Vehicle detail retrieved successfully",
        data: vehicle,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
