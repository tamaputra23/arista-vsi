import { z } from "zod";
import { prisma } from "../lib/prisma";
import { companyBranchCache } from "../lib/cache";

// ---- Field Format Regexes ----

const EXTERNAL_ID_RE = /^[A-Za-z0-9_-]+$/;
const COMPANY_CODE_RE = /^[A-Za-z0-9-]+$/;
const BRANCH_CODE_RE = /^[A-Za-z0-9-]+$/;
const BRAND_MODEL_RE = /^[A-Za-z0-9 &()._-]+$/;
const COLOR_RE = /^[A-Za-z ]+$/;
const CHASSIS_NUMBER_RE = /^[A-HJ-NPR-Z0-9]{11,17}$/;
const ENGINE_NUMBER_RE = /^[A-Za-z0-9-]+$/;

// ---- Cached entity lookups (24h TTL — static reference data) ----

/** Cache for company/branch existence checks — same instance as dashboard cache */
const entityCache = companyBranchCache;

async function companyExists(code: string): Promise<boolean> {
  const cacheKey = `company:${code}`;
  const cached = entityCache.get(cacheKey);
  if (cached !== undefined) return cached as boolean;

  const exists = (await prisma.company.count({ where: { code } })) > 0;
  entityCache.set(cacheKey, exists);
  return exists;
}

async function branchBelongsToCompany(
  branchCode: string,
  companyCode: string,
): Promise<boolean> {
  const cacheKey = `branch:${branchCode}:${companyCode}`;
  const cached = entityCache.get(cacheKey);
  if (cached !== undefined) return cached as boolean;

  const exists =
    (await prisma.branch.count({
      where: { code: branchCode, companyCode },
    })) > 0;
  entityCache.set(cacheKey, exists);
  return exists;
}

// ---- POST /api/vehicles body ----

export const createVehicleBodySchema = z.object({
  external_id: z
    .string()
    .min(1, "external_id is required")
    .max(50)
    .regex(EXTERNAL_ID_RE, "external_id must contain only letters, numbers, hyphens, and underscores"),
  company_code: z
    .string()
    .min(1, "company_code is required")
    .max(20)
    .regex(COMPANY_CODE_RE, "company_code must contain only letters, numbers, and hyphens"),
  branch_code: z
    .string()
    .min(1, "branch_code is required")
    .max(20)
    .regex(BRANCH_CODE_RE, "branch_code must contain only letters, numbers, and hyphens"),
  brand: z
    .string()
    .min(1, "brand is required")
    .max(100)
    .regex(BRAND_MODEL_RE, "brand contains invalid characters"),
  model: z
    .string()
    .min(1, "model is required")
    .max(100)
    .regex(BRAND_MODEL_RE, "model contains invalid characters"),
  year: z
    .number({ required_error: "year is required" })
    .int("year must be an integer")
    .min(1900, "year must be >= 1900")
    .max(2100, "year must be <= 2100"),
  color: z
    .string()
    .min(1, "color is required")
    .max(50)
    .regex(COLOR_RE, "color must contain only letters and spaces"),
  chassis_number: z
    .string()
    .min(1, "chassis_number is required")
    .max(50)
    .regex(
      CHASSIS_NUMBER_RE,
      "chassis_number must be 11-17 alphanumeric characters (no I, O, Q)",
    ),
  engine_number: z
    .string()
    .min(1, "engine_number is required")
    .max(50)
    .regex(ENGINE_NUMBER_RE, "engine_number must contain only letters, numbers, and hyphens"),
  status: z.enum(
    [
      "IN_TRANSIT",
      "RECEIVED",
      "READY_STOCK",
      "BOOKED",
      "DELIVERED",
      "CANCELLED",
    ],
    {
      errorMap: () => ({
        message:
          "status must be one of: IN_TRANSIT, RECEIVED, READY_STOCK, BOOKED, DELIVERED, CANCELLED",
      }),
    },
  ),
  updated_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "updated_at must be a valid ISO 8601 timestamp",
  }),
});

// ---- Business rule: company_code and branch_code must exist ----

export const createVehicleWithBusinessRules = createVehicleBodySchema
  .refine(
    async (data) => {
      return await companyExists(data.company_code);
    },
    {
      message: "Company does not exist",
      path: ["company_code"],
    },
  )
  .refine(
    async (data) => {
      return await branchBelongsToCompany(data.branch_code, data.company_code);
    },
    {
      message: "Branch does not belong to this company",
      path: ["branch_code"],
    },
  );

// ---- GET /api/vehicles query ----

export const listVehiclesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  company_code: z.string().optional(),
  branch_code: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  status: z.string().optional(),
  chassis_number: z.string().optional(),
  year_from: z.coerce.number().int().optional(),
  year_to: z.coerce.number().int().optional(),
  order_by: z
    .enum(["created_at", "updated_at", "brand", "model"])
    .optional()
    .default("updated_at"),
  sort: z.enum(["asc", "desc"]).optional().default("desc"),
});

// ---- GET /api/integration-logs query ----

export const listLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(50),
  status: z.enum(["success", "failure"]).optional(),
  external_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  company_code: z.string().optional(),
});

// ---- POST /api/simulations/duplicate-request ----

export const simulationRequestSchema = createVehicleBodySchema.extend({
  parallel_count: z.coerce
    .number()
    .int()
    .min(2, "parallel_count must be at least 2")
    .max(50, "parallel_count must be at most 50")
    .default(10),
});
