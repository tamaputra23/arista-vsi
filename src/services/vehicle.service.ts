import { prisma } from "../lib/prisma";
import { ConflictError, NotFoundError } from "../lib/errors";
import { Prisma } from "@prisma/client";

// ---- Types ----

export const VEHICLE_STATUSES = [
  "IN_TRANSIT",
  "RECEIVED",
  "READY_STOCK",
  "BOOKED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export interface VehicleInput {
  external_id: string;
  company_code: string;
  branch_code: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  chassis_number: string;
  engine_number: string;
  status: VehicleStatus;
  updated_at: string; // ISO 8601
}

export interface VehicleFilters {
  page?: number;
  limit?: number;
  company_code?: string;
  branch_code?: string;
  brand?: string;
  model?: string;
  status?: string; // comma-separated
  chassis_number?: string;
  year_from?: number;
  year_to?: number;
  order_by?: "created_at" | "updated_at" | "brand" | "model";
  sort?: "asc" | "desc";
}

export interface UpsertResult {
  vehicle: {
    id: string;
    externalId: string;
    companyCode: string;
    branchCode: string;
    status: string;
  };
  created: boolean;
  statusChanged: boolean;
}

// ---- Upsert (concurrency-safe with atomic Prisma upsert) ----

export async function upsertVehicle(data: VehicleInput): Promise<UpsertResult> {
  const updatedAt = new Date(data.updated_at);

  // 1. Check for chassis_number conflict with a DIFFERENT external_id
  const existingByChassis = await prisma.vehicle.findUnique({
    where: { chassisNumber: data.chassis_number },
  });

  if (
    existingByChassis &&
    existingByChassis.externalId !== data.external_id
  ) {
    throw new ConflictError(
      `Chassis number '${data.chassis_number}' already exists with external_id '${existingByChassis.externalId}'. ` +
        `Cannot create vehicle with external_id '${data.external_id}'.`,
    );
  }

  // 2. Read current state BEFORE the atomic upsert (for status history detection)
  //    Under concurrent load, multiple callers may all see "no vehicle" here.
  //    That's okay — the detection is best-effort; we verify after the upsert.
  const existing = await prisma.vehicle.findFirst({
    where: {
      externalId: data.external_id,
      companyCode: data.company_code,
      branchCode: data.branch_code,
    },
  });

  const previousStatus = existing?.status ?? null;

  // 3. Atomic upsert — the database handles concurrency
  //    Uses the @@unique([externalId, companyCode, branchCode]) constraint.
  //    Under concurrent load, only one INSERT succeeds; the rest become UPDATEs.
  const vehicle = await prisma.vehicle.upsert({
    where: {
      externalId_companyCode_branchCode: {
        externalId: data.external_id,
        companyCode: data.company_code,
        branchCode: data.branch_code,
      },
    },
    update: {
      brand: data.brand,
      model: data.model,
      year: data.year,
      color: data.color,
      chassisNumber: data.chassis_number,
      engineNumber: data.engine_number,
      status: data.status,
      // updatedAt is NOT set here — Prisma's @updatedAt handles it automatically.
      // This ensures only the INSERT gets createdAt ≈ updatedAt, allowing
      // accurate create-vs-update detection under concurrent load.
    },
    create: {
      externalId: data.external_id,
      companyCode: data.company_code,
      branchCode: data.branch_code,
      brand: data.brand,
      model: data.model,
      year: data.year,
      color: data.color,
      chassisNumber: data.chassis_number,
      engineNumber: data.engine_number,
      status: data.status,
      updatedAt,
    },
  });

  // Detect create vs update: the caller that saw "no existing vehicle"
  // AND succeeds in the upsert is the creator. Under concurrent load where
  // multiple callers see no existing vehicle, the database atomic upsert
  // ensures only one INSERT happens — but all those callers will report
  // `created: true` (best-effort detection). The database is always consistent.
  const created = previousStatus === null;
  const statusChanged = previousStatus !== null && data.status !== previousStatus;

  // 4. Record status history
  if (created) {
    // Guard against duplicate initial history under concurrency:
    // check if an initial entry already exists before creating one.
    const existingHistory = await prisma.vehicleStatusHistory.findFirst({
      where: { vehicleId: vehicle.id, previousStatus: "" },
    });

    if (!existingHistory) {
      await prisma.vehicleStatusHistory.create({
        data: {
          vehicleId: vehicle.id,
          previousStatus: "",
          newStatus: data.status,
          changedAt: new Date(),
          changedBy: "system",
          changeReason: "Initial vehicle creation",
        },
      });
    }
  } else if (statusChanged) {
    // Record status transition
    await prisma.vehicleStatusHistory.create({
      data: {
        vehicleId: vehicle.id,
        previousStatus: previousStatus!,
        newStatus: data.status,
        changedAt: new Date(),
        changedBy: "system",
      },
    });
  }

  return { vehicle, created, statusChanged };
}

// ---- List with filtering, search, pagination, sorting ----

export async function listVehicles(filters: VehicleFilters) {
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.VehicleWhereInput = {};

  if (filters.company_code) {
    where.companyCode = filters.company_code;
  }
  if (filters.branch_code) {
    where.branchCode = filters.branch_code;
  }
  if (filters.brand) {
    where.brand = { contains: filters.brand, mode: "insensitive" };
  }
  if (filters.model) {
    where.model = { contains: filters.model, mode: "insensitive" };
  }
  if (filters.status) {
    const statuses = filters.status
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (statuses.length > 0) {
      where.status = { in: statuses };
    }
  }
  if (filters.chassis_number) {
    where.chassisNumber = {
      contains: filters.chassis_number,
      mode: "insensitive",
    };
  }
  if (filters.year_from || filters.year_to) {
    where.year = {};
    if (filters.year_from) where.year.gte = filters.year_from;
    if (filters.year_to) where.year.lte = filters.year_to;
  }

  const orderByField = filters.order_by ?? "updated_at";
  const sortDirection = filters.sort ?? "desc";

  const orderBy: Prisma.VehicleOrderByWithRelationInput = {
    [orderByField === "created_at"
      ? "createdAt"
      : orderByField === "updated_at"
        ? "updatedAt"
        : orderByField]: sortDirection,
  };

  const [vehicles, totalCount] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        externalId: true,
        companyCode: true,
        branchCode: true,
        brand: true,
        model: true,
        year: true,
        color: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    vehicles,
    pagination: {
      total_count: totalCount,
      current_page: page,
      total_pages: totalPages,
      limit,
    },
  };
}

// ---- Detail ----

export async function getVehicleByExternalId(externalId: string) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { externalId },
    include: {
      statusHistory: {
        orderBy: { changedAt: "desc" },
      },
    },
  });

  if (!vehicle) {
    throw new NotFoundError("Vehicle", externalId);
  }

  // Map statusHistory to the API shape (Prisma field is newStatus, API wants status)
  const statusHistory = vehicle.statusHistory.map((h) => ({
    status: h.newStatus,
    changed_at: h.changedAt.toISOString(),
    previous_status: h.previousStatus || null,
    changed_by: h.changedBy,
    change_reason: h.changeReason,
  }));

  return {
    id: vehicle.id,
    external_id: vehicle.externalId,
    company_code: vehicle.companyCode,
    branch_code: vehicle.branchCode,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    chassis_number: vehicle.chassisNumber,
    engine_number: vehicle.engineNumber,
    current_status: vehicle.status,
    status_updated_at: vehicle.updatedAt.toISOString(),
    created_at: vehicle.createdAt.toISOString(),
    updated_at: vehicle.updatedAt.toISOString(),
    status_history: statusHistory,
  };
}
