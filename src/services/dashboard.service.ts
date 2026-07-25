import { prisma } from "../lib/prisma";
import { dashboardCache } from "../lib/cache";
import { VEHICLE_STATUSES } from "./vehicle.service";

const CACHE_KEY = "dashboard:summary";

export interface DashboardSummary {
  total_vehicles: number;
  updated_today: number;
  ready_stock_count: number;
  delivered_count: number;
  by_status: Record<string, number>;
  by_company: Record<string, number>;
  by_branch: Record<string, number>;
  top_5_models: { model: string; count: number }[];
  cache_timestamp: string;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const cached = dashboardCache.get(CACHE_KEY) as DashboardSummary | undefined;
  if (cached) {
    return cached;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Run all aggregations in parallel
  const [
    totalVehicles,
    updatedToday,
    statusCounts,
    companyCounts,
    branchCounts,
    topModels,
  ] = await Promise.all([
    // total_vehicles
    prisma.vehicle.count(),

    // updated_today
    prisma.vehicle.count({
      where: { updatedAt: { gte: today } },
    }),

    // by_status — group by status
    prisma.vehicle.groupBy({
      by: ["status"],
      _count: { status: true },
    }),

    // by_company
    prisma.vehicle.groupBy({
      by: ["companyCode"],
      _count: { companyCode: true },
    }),

    // by_branch
    prisma.vehicle.groupBy({
      by: ["branchCode"],
      _count: { branchCode: true },
    }),

    // top_5_models
    prisma.vehicle.groupBy({
      by: ["model"],
      _count: { model: true },
      orderBy: { _count: { model: "desc" } },
      take: 5,
    }),
  ]);

  // Build status counts with all enum values present (even if zero)
  const by_status: Record<string, number> = {};
  for (const status of VEHICLE_STATUSES) {
    by_status[status] = 0;
  }
  for (const row of statusCounts) {
    by_status[row.status] = row._count.status;
  }

  const readyStockCount = by_status["READY_STOCK"] || 0;
  const deliveredCount = by_status["DELIVERED"] || 0;

  // Build company counts
  const by_company: Record<string, number> = {};
  for (const row of companyCounts) {
    by_company[row.companyCode] = row._count.companyCode;
  }

  // Build branch counts
  const by_branch: Record<string, number> = {};
  for (const row of branchCounts) {
    by_branch[row.branchCode] = row._count.branchCode;
  }

  // Build top models
  const top_5_models = topModels.map((row) => ({
    model: row.model,
    count: row._count.model,
  }));

  const summary: DashboardSummary = {
    total_vehicles: totalVehicles,
    updated_today: updatedToday,
    ready_stock_count: readyStockCount,
    delivered_count: deliveredCount,
    by_status,
    by_company,
    by_branch,
    top_5_models,
    cache_timestamp: new Date().toISOString(),
  };

  // Cache for the configured TTL
  dashboardCache.set(CACHE_KEY, summary);

  return summary;
}

/** Invalidate the dashboard cache (called after vehicle upserts) */
export function invalidateDashboardCache(): void {
  dashboardCache.delete(CACHE_KEY);
}
