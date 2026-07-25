import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./config/env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Vehicle Stock Integration & Monitoring API",
      version: env.APP_VERSION,
      description: `Centralized platform for aggregating vehicle inventory data from multiple branch operational systems.

## Features
- **Idempotent vehicle ingestion** via \`POST /api/vehicles\`
- **Duplicate prevention** using external_id + chassis_number matching
- **Status lifecycle tracking** with full audit history
- **Real-time dashboard** with aggregated metrics (5-min cache)
- **Integration audit trail** for compliance and debugging

## Authentication (Phase 4 — Dual)

**Both headers are mandatory** on all endpoints except \`/health\`:

| Header | Value |
|---|---|
| \`Authorization\` | \`Bearer <jwt-token>\` — HS256 JWT with signed role claim |
| \`X-API-Key\` | \`<api-key>\` — configured in server \`API_KEYS\` |

The **JWT role** is the source of truth for authorization:
| Role | Permissions |
|------|------------|
| **branch** | POST /api/vehicles |
| **ops** | GET /api/vehicles, GET /api/vehicles/{id}, GET /api/dashboard/summary |
| **admin** | All endpoints including GET /api/integration-logs |

Use the **Authorize** button (🔒) to set both credentials before trying endpoints.
`,
      contact: {
        name: "API Support",
      },
      license: {
        name: "Proprietary",
      },
    },
    servers: [
      {
        url: process.env.SWAGGER_URL || `http://localhost:${env.PORT}`,
        description: process.env.SWAGGER_URL ? "Production server" : "Development server",
      },
    ],
    tags: [
      { name: "Vehicles", description: "Vehicle data ingestion and retrieval" },
      { name: "Dashboard", description: "Aggregated monitoring metrics" },
      { name: "Integration Logs", description: "Audit trail for API requests" },
      { name: "Health", description: "System health and status" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "HS256 JWT token. Payload must include { role: 'admin'|'ops'|'branch' } signed with JWT_SECRET.",
        },
        apiKey: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "API key configured in server API_KEYS env var (format: role:key).",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "object",
              additionalProperties: { type: "array", items: { type: "string" } },
              example: { chassis_number: ["Chassis number is required"] },
            },
          },
        },
        VehicleInput: {
          type: "object",
          required: ["external_id", "company_code", "branch_code", "brand", "model", "year", "color", "chassis_number", "engine_number", "status", "updated_at"],
          properties: {
            external_id: { type: "string", maxLength: 50, example: "ADMS-000123", description: "External system identifier from branch" },
            company_code: { type: "string", maxLength: 20, example: "PT-AKA", description: "Company identifier" },
            branch_code: { type: "string", maxLength: 20, example: "JKT01", description: "Branch identifier" },
            brand: { type: "string", maxLength: 100, example: "Hyundai" },
            model: { type: "string", maxLength: 100, example: "Creta" },
            year: { type: "integer", minimum: 1900, maximum: 2100, example: 2026 },
            color: { type: "string", maxLength: 50, example: "Black" },
            chassis_number: { type: "string", maxLength: 50, example: "KMHXX123456789012", description: "VIN-equivalent; globally unique" },
            engine_number: { type: "string", maxLength: 50, example: "G4FXX123456", description: "Engine serial number (excluded from logs)" },
            status: { type: "string", enum: ["IN_TRANSIT", "RECEIVED", "READY_STOCK", "BOOKED", "DELIVERED", "CANCELLED"], example: "READY_STOCK" },
            updated_at: { type: "string", format: "date-time", example: "2026-07-20T10:30:00+07:00", description: "ISO 8601 timestamp" },
          },
        },
        VehicleListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Vehicles retrieved successfully" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/VehicleSummary" },
            },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        },
        VehicleSummary: {
          type: "object",
          properties: {
            external_id: { type: "string", example: "ADMS-000123" },
            company_code: { type: "string", example: "PT-AKA" },
            branch_code: { type: "string", example: "JKT01" },
            brand: { type: "string", example: "Hyundai" },
            model: { type: "string", example: "Creta" },
            year: { type: "integer", example: 2026 },
            color: { type: "string", example: "Black" },
            status: { type: "string", example: "READY_STOCK" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        VehicleDetailResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Vehicle detail retrieved successfully" },
            data: { $ref: "#/components/schemas/VehicleDetail" },
          },
        },
        VehicleDetail: {
          type: "object",
          properties: {
            id: { type: "string", example: "clx..." },
            external_id: { type: "string" },
            company_code: { type: "string" },
            branch_code: { type: "string" },
            brand: { type: "string" },
            model: { type: "string" },
            year: { type: "integer" },
            color: { type: "string" },
            chassis_number: { type: "string" },
            engine_number: { type: "string" },
            current_status: { type: "string" },
            status_updated_at: { type: "string", format: "date-time" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            status_history: { type: "array", items: { $ref: "#/components/schemas/StatusHistoryEntry" } },
          },
        },
        StatusHistoryEntry: {
          type: "object",
          properties: {
            status: { type: "string", example: "READY_STOCK" },
            changed_at: { type: "string", format: "date-time" },
            previous_status: { type: "string", nullable: true, example: "RECEIVED" },
            changed_by: { type: "string", example: "system" },
            change_reason: { type: "string", nullable: true },
          },
        },
        DashboardSummaryResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { $ref: "#/components/schemas/DashboardSummary" },
          },
        },
        DashboardSummary: {
          type: "object",
          properties: {
            total_vehicles: { type: "integer", example: 120 },
            updated_today: { type: "integer", example: 15 },
            ready_stock_count: { type: "integer", example: 55 },
            delivered_count: { type: "integer", example: 25 },
            by_status: { type: "object", example: { IN_TRANSIT: 10, RECEIVED: 10, READY_STOCK: 55, BOOKED: 15, DELIVERED: 25, CANCELLED: 5 } },
            by_company: { type: "object", example: { "PT-AKA": 65, "PT-AJN": 55 } },
            by_branch: { type: "object", example: { JKT01: 30, BDG02: 20 } },
            top_5_models: { type: "array", items: { type: "object", properties: { model: { type: "string" }, count: { type: "integer" } } } },
            cache_timestamp: { type: "string", format: "date-time" },
          },
        },
        IntegrationLogResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "array", items: { $ref: "#/components/schemas/IntegrationLogEntry" } },
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        },
        IntegrationLogEntry: {
          type: "object",
          properties: {
            correlation_id: { type: "string", example: "req-abc-123" },
            request_timestamp: { type: "string", format: "date-time" },
            endpoint: { type: "string", example: "/api/vehicles" },
            http_method: { type: "string", example: "POST" },
            external_id: { type: "string", nullable: true },
            company_code: { type: "string", nullable: true },
            success: { type: "boolean" },
            http_status_code: { type: "integer" },
            error_message: { type: "string", nullable: true },
            processing_time_ms: { type: "integer" },
            request_payload_summary: { type: "object", nullable: true, description: "Sanitized — excludes chassis_number and engine_number" },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["healthy", "degraded", "unhealthy"], example: "healthy" },
            database: { type: "string", enum: ["connected", "disconnected"], example: "connected" },
            version: { type: "string", example: "1.0.0" },
            server_time: { type: "string", format: "date-time" },
            response_time_ms: { type: "integer", example: 15 },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            total_count: { type: "integer", example: 100 },
            current_page: { type: "integer", example: 1 },
            total_pages: { type: "integer", example: 5 },
            limit: { type: "integer", example: 20 },
          },
        },
      },
    },
    paths: {
      "/api/vehicles": {
        post: {
          tags: ["Vehicles"],
          summary: "Ingest vehicle data",
          description: "Receive vehicle data from external branch systems. **Idempotent:** replaying the same request produces the same result. Detects status changes and records them to history. Returns 409 if chassis_number conflicts with a different external_id.",
          security: [{ bearerAuth: [], apiKey: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/VehicleInput" } } },
          },
          responses: {
            200: {
              description: "Vehicle created or updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Vehicle data processed successfully" },
                      data: {
                        type: "object",
                        properties: {
                          external_id: { type: "string", example: "ADMS-000123" },
                          status: { type: "string", example: "READY_STOCK" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: "Validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Missing or invalid authentication" },
            403: { description: "Insufficient permissions" },
            409: { description: "Chassis number conflict with different external_id" },
          },
        },
        get: {
          tags: ["Vehicles"],
          summary: "List vehicles",
          description: "Retrieve a paginated list of vehicles with filtering, searching, and sorting. Sensitive fields (engine_number, chassis_number) are excluded from list results.",
          security: [{ bearerAuth: [], apiKey: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20, minimum: 1, maximum: 100 } },
            { name: "company_code", in: "query", schema: { type: "string" }, description: "Filter by company code" },
            { name: "branch_code", in: "query", schema: { type: "string" }, description: "Filter by branch code" },
            { name: "brand", in: "query", schema: { type: "string" }, description: "Filter by brand (case-insensitive, partial)" },
            { name: "model", in: "query", schema: { type: "string" }, description: "Filter by model (case-insensitive, partial)" },
            { name: "status", in: "query", schema: { type: "string" }, description: "Filter by status. Comma-separated for multiple (e.g., READY_STOCK,BOOKED)" },
            { name: "chassis_number", in: "query", schema: { type: "string" }, description: "Search by chassis number (partial match)" },
            { name: "year_from", in: "query", schema: { type: "integer" }, description: "Filter vehicles with year >= this value" },
            { name: "year_to", in: "query", schema: { type: "integer" }, description: "Filter vehicles with year <= this value" },
            { name: "order_by", in: "query", schema: { type: "string", enum: ["created_at", "updated_at", "brand", "model"], default: "updated_at" } },
            { name: "sort", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
          ],
          responses: {
            200: { description: "Paginated vehicle list", content: { "application/json": { schema: { $ref: "#/components/schemas/VehicleListResponse" } } } },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/vehicles/{external_id}": {
        get: {
          tags: ["Vehicles"],
          summary: "Get vehicle detail",
          description: "Retrieve complete vehicle information including full status change history.",
          security: [{ bearerAuth: [], apiKey: [] }],
          parameters: [
            { name: "external_id", in: "path", required: true, schema: { type: "string" }, description: "External system identifier" },
          ],
          responses: {
            200: { description: "Vehicle detail with status history", content: { "application/json": { schema: { $ref: "#/components/schemas/VehicleDetailResponse" } } } },
            401: { description: "Unauthorized" },
            404: { description: "Vehicle not found" },
          },
        },
      },
      "/api/dashboard/summary": {
        get: {
          tags: ["Dashboard"],
          summary: "Get dashboard summary",
          description: "Aggregated vehicle stock metrics. Results are cached for 5 minutes. Cache is invalidated on successful vehicle ingestion.",
          security: [{ bearerAuth: [], apiKey: [] }],
          responses: {
            200: { description: "Aggregated metrics", content: { "application/json": { schema: { $ref: "#/components/schemas/DashboardSummaryResponse" } } } },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/integration-logs": {
        get: {
          tags: ["Integration Logs"],
          summary: "List integration logs",
          description: "Paginated audit trail of all API requests (success and failure). **Admin access only.** Sensitive data is excluded from payload summaries.",
          security: [{ bearerAuth: [], apiKey: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 50, minimum: 1, maximum: 500 } },
            { name: "status", in: "query", schema: { type: "string", enum: ["success", "failure"] }, description: "Filter by integration result" },
            { name: "external_id", in: "query", schema: { type: "string" }, description: "Filter by vehicle external_id" },
            { name: "date_from", in: "query", schema: { type: "string" }, description: "Filter from date (ISO 8601)" },
            { name: "date_to", in: "query", schema: { type: "string" }, description: "Filter to date (ISO 8601)" },
            { name: "company_code", in: "query", schema: { type: "string" }, description: "Filter by company code" },
          ],
          responses: {
            200: { description: "Paginated integration logs", content: { "application/json": { schema: { $ref: "#/components/schemas/IntegrationLogResponse" } } } },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden — admin role required" },
          },
        },
      },
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          description: "Check application and database status. No authentication required. Returns 503 if database is disconnected.",
          security: [],
          responses: {
            200: { description: "System healthy", content: { "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } } } },
            503: { description: "System unhealthy or degraded" },
          },
        },
      },
    },
  } as swaggerJsdoc.Options["definition"],
  apis: [], // Spec is defined inline above — no need for JSDoc scanning
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
