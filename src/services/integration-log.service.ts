import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

// ---- Types ----

export interface CreateLogInput {
  correlationId: string;
  endpoint: string;
  httpMethod: string;
  externalId?: string;
  success: boolean;
  httpStatusCode: number;
  errorMessage?: string;
  processingTimeMs: number;
  requestPayloadSummary?: Record<string, unknown>;
  companyCode?: string;
}

export interface LogFilters {
  page?: number;
  limit?: number;
  status?: string; // "success" | "failure"
  external_id?: string;
  date_from?: string;
  date_to?: string;
  company_code?: string;
}

// ---- Create ----

export async function createIntegrationLog(data: CreateLogInput) {
  // Sanitize payload — exclude sensitive fields
  const sanitizedSummary = data.requestPayloadSummary
    ? sanitizePayload(data.requestPayloadSummary)
    : undefined;

  return prisma.integrationLog.create({
    data: {
      correlationId: data.correlationId,
      requestTimestamp: new Date(),
      endpoint: data.endpoint,
      httpMethod: data.httpMethod,
      externalId: data.externalId ?? null,
      success: data.success,
      httpStatusCode: data.httpStatusCode,
      errorMessage: data.errorMessage ?? null,
      processingTimeMs: data.processingTimeMs,
      requestPayloadSummary: sanitizedSummary
        ? JSON.stringify(sanitizedSummary)
        : null,
      companyCode: data.companyCode ?? null,
    },
  });
}

// ---- List with filters and pagination ----

export async function listIntegrationLogs(filters: LogFilters) {
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 50, 500);
  const skip = (page - 1) * limit;

  const where: Prisma.IntegrationLogWhereInput = {};

  if (filters.status) {
    where.success = filters.status === "success";
  }
  if (filters.external_id) {
    where.externalId = filters.external_id;
  }
  if (filters.company_code) {
    where.companyCode = filters.company_code;
  }
  if (filters.date_from || filters.date_to) {
    where.requestTimestamp = {};
    if (filters.date_from) {
      where.requestTimestamp.gte = new Date(filters.date_from);
    }
    if (filters.date_to) {
      where.requestTimestamp.lte = new Date(filters.date_to);
    }
  }

  const [logs, totalCount] = await Promise.all([
    prisma.integrationLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { requestTimestamp: "desc" },
      select: {
        correlationId: true,
        requestTimestamp: true,
        endpoint: true,
        httpMethod: true,
        externalId: true,
        companyCode: true,
        success: true,
        httpStatusCode: true,
        errorMessage: true,
        processingTimeMs: true,
        requestPayloadSummary: true,
      },
    }),
    prisma.integrationLog.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Parse payload summary from JSON string back to object
  const data = logs.map((log) => ({
    correlation_id: log.correlationId,
    request_timestamp: log.requestTimestamp.toISOString(),
    endpoint: log.endpoint,
    http_method: log.httpMethod,
    external_id: log.externalId,
    company_code: log.companyCode,
    success: log.success,
    http_status_code: log.httpStatusCode,
    error_message: log.errorMessage,
    processing_time_ms: log.processingTimeMs,
    request_payload_summary: log.requestPayloadSummary
      ? JSON.parse(log.requestPayloadSummary)
      : null,
  }));

  return {
    logs: data,
    pagination: {
      total_count: totalCount,
      current_page: page,
      total_pages: totalPages,
      limit,
    },
  };
}

// ---- Helpers ----

const SENSITIVE_FIELDS = ["chassis_number", "engine_number", "chassisNumber", "engineNumber"];

function sanitizePayload(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!SENSITIVE_FIELDS.includes(key)) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
