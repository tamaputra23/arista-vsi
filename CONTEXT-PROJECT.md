# CONTEXT-PROJECT.md

Self-contained onboarding document for the Vehicle Stock Integration Platform. Read this first — it synthesizes all docs and source code into one file. Drop this into any LLM or share with any developer to bootstrap work on this project.

---

## What This Project Is

A centralized **Vehicle Stock Integration & Monitoring** backend API. Branch automotive systems (dealerships, warehouses) send vehicle inventory data to this central service. The platform prevents duplicates, tracks vehicle status changes (IN_TRANSIT → RECEIVED → READY_STOCK → BOOKED → DELIVERED), and provides a monitoring dashboard and audit trail.

**Scope:** Backend API only (no frontend). All 6 endpoints implemented. Docker-ready.

## Quick Start (What to Run)

```bash
# 1. Install
npm install

# 2. Set up environment
cp .env.example .env          # Edit DATABASE_URL to point to your PostgreSQL

# 3. Database
npx prisma migrate dev --name init   # Create tables
npm run db:seed                       # Seed companies + branches

# 4. Run
npm run dev                           # Start on port 6300

# 5. Test
# Create a test database first: createdb vehicle_stock_test
npm test                              # Jest + Supertest, needs DB

# Docker alternative
docker-compose up -d                  # App + PostgreSQL 15, no manual DB setup
```

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js 20+ (TypeScript) | Async I/O for high-throughput API |
| Framework | Express.js | Ecosystem, middleware, team familiarity |
| ORM | Prisma 5.x | Type-safe queries, auto-migrations |
| Database | PostgreSQL 15 | ACID compliance, JSON support |
| Validation | Zod | TypeScript-first, type inference from schemas |
| Logging | Winston | Structured JSON logging |
| Testing | Jest + Supertest | Integration tests hit Express in-process |
| Auth | Bearer token / API key | Validated against env-configured keys |
| Container | Docker + Docker Compose | App + DB containers with health checks |

## Project Structure

```
D:\Arista\
├── prisma/
│   ├── schema.prisma          # Database schema (5 tables, 16 indexes)
│   └── seed.ts                # Seed data: 2 companies, 3 branches
├── src/
│   ├── server.ts              # Entry point — connects DB, starts Express, graceful shutdown
│   ├── app.ts                 # Express app assembly — middleware → routes → error handler
│   ├── config/
│   │   └── env.ts             # Zod-validated env vars: DATABASE_URL, PORT, API_KEYS, etc.
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton (globalThis cache in dev)
│   │   ├── logger.ts          # Winston JSON logger (pretty-print in dev)
│   │   ├── errors.ts          # AppError, ValidationError, NotFoundError, ConflictError, UnauthorizedError
│   │   └── cache.ts           # In-memory Map-based TTL cache (used by dashboard)
│   ├── middleware/
│   │   ├── correlationId.ts   # UUID per request, attaches to req + response header
│   │   ├── errorHandler.ts    # Catches all errors, formats per API spec
│   │   ├── requestLogger.ts   # Logs method, url, status, duration for every request
│   │   ├── validate.ts        # Zod schema validator factory — validate({ body, query, params })
│   │   └── auth.ts            # Bearer token validation against env-configured API_KEYS
│   ├── services/
│   │   ├── vehicle.service.ts       # upsertVehicle, listVehicles, getVehicleByExternalId
│   │   ├── dashboard.service.ts     # getDashboardSummary (cached 5 min)
│   │   └── integration-log.service.ts  # createLog, listLogs
│   └── routes/
│       ├── schemas.ts         # Zod schemas for POST body, GET query params
│       ├── health.ts          # GET /health (public)
│       ├── vehicles.ts        # POST /api/vehicles, GET /api/vehicles, GET /api/vehicles/:id
│       ├── dashboard.ts       # GET /api/dashboard/summary
│       └── integration-logs.ts # GET /api/integration-logs
├── tests/
│   ├── setup.ts               # Loads .env.test before tests
│   ├── helpers/db.ts          # cleanDatabase(), seedTestData(), disconnect()
│   ├── integration/
│   │   ├── health.test.ts
│   │   ├── vehicles.test.ts   # POST upsert, GET list, GET detail, 409 conflict, 400 validation, auth
│   │   ├── dashboard.test.ts
│   │   └── integration-logs.test.ts
│   └── unit/services/
│       └── vehicle.service.test.ts  # upsertVehicle, listVehicles, getVehicleByExternalId
├── docker-compose.yml         # app + db services, persistent volume, health checks
├── Dockerfile                 # Multi-stage Node.js 20 Alpine build
├── .env.example               # Template — copy to .env
├── .env.test                  # Test database config
├── package.json               # Scripts: dev, build, test, db:*, docker:*
├── tsconfig.json              # Strict TS, ES2020, CommonJS, path aliases (@/ → src/)
├── tsconfig.build.json        # Extends tsconfig, excludes tests
├── jest.config.ts             # ts-jest, setupFiles, coverage thresholds
└── CLAUDE.md                  # Claude Code guidance (subset of this document)
```

## Database Schema (5 Tables)

### `company`
| Column | Type | Notes |
|---|---|---|
| code | VARCHAR(20) PK | "PT-AKA", "PT-AJN" |
| name | VARCHAR(200) | Full company name |
| created_at | TIMESTAMP | |

### `branch`
| Column | Type | Notes |
|---|---|---|
| code | VARCHAR(20) PK | "JKT01", "JKT02", "SBY01" |
| company_code | VARCHAR(20) FK → company | |
| name | VARCHAR(200) | |
| location | VARCHAR(500) | Nullable |
| created_at | TIMESTAMP | |

### `vehicle` (core table)
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | CUID |
| external_id | VARCHAR(50) | From branch system |
| company_code | VARCHAR(20) FK → company | |
| branch_code | VARCHAR(20) FK → branch | |
| brand, model | VARCHAR(100) | |
| year | INT | 1900–2100 |
| color | VARCHAR(50) | |
| chassis_number | VARCHAR(50) UNIQUE | VIN-equivalent; globally unique |
| engine_number | VARCHAR(50) | Sensitive — excluded from logs |
| status | VARCHAR(20) | Enum: IN_TRANSIT, RECEIVED, READY_STOCK, BOOKED, DELIVERED, CANCELLED |
| created_at, updated_at | TIMESTAMP | |

**Unique constraint:** `(external_id, company_code, branch_code)` — enables idempotent upsert.

### `vehicle_status_history` (append-only audit)
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | CUID |
| vehicle_id | TEXT FK → vehicle | CASCADE delete |
| previous_status | VARCHAR(20) | Empty string on initial creation |
| new_status | VARCHAR(20) | |
| changed_at | TIMESTAMP | |
| changed_by | VARCHAR(100) | "system" for API-driven changes |
| change_reason | VARCHAR(500) | Nullable |

### `integration_log` (API request audit)
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | CUID |
| correlation_id | VARCHAR(50) UNIQUE | Request tracing |
| request_timestamp | TIMESTAMP | |
| endpoint, http_method | VARCHAR | |
| external_id | VARCHAR(50) | Nullable |
| success | BOOLEAN | |
| http_status_code | INT | |
| error_message | VARCHAR(500) | Nullable |
| processing_time_ms | INT | |
| request_payload_summary | VARCHAR(1000) | JSON string; chassis + engine excluded |
| company_code | VARCHAR(20) | Nullable |

## API Endpoints (6 total)

### `POST /api/vehicles` — Vehicle ingestion (idempotent)
- **Auth:** Branch, Admin
- **Body:** `{ external_id, company_code, branch_code, brand, model, year, color, chassis_number, engine_number, status, updated_at }` — all required
- **Logic:**
  1. Validate body with Zod
  2. Check chassis_number uniqueness — if conflicts with different external_id → `409 Conflict`
  3. Lookup by `(external_id, company_code, branch_code)` — if exists → update; else → create
  4. If status changed from previous → insert into `vehicle_status_history`
  5. Invalidate dashboard cache
  6. Write integration log (success or failure)
- **Response 200:** `{ success: true, message: "...", data: { external_id, status } }`
- **Response 400:** `{ success: false, message: "Validation failed", errors: { field: ["msg"] } }`
- **Response 409:** Chassis conflict
- **Idempotent:** Replaying the same request produces the same result

### `GET /api/vehicles` — Vehicle list (paginated)
- **Auth:** Ops, Admin
- **Query params:** `page` (default 1), `limit` (default 20, max 100), `company_code`, `branch_code`, `brand`, `model`, `status` (comma-separated), `chassis_number` (partial match), `year_from`, `year_to`, `order_by` (created_at/updated_at/brand/model, default updated_at), `sort` (asc/desc, default desc)
- **Response:** `{ success, message, data: [...], pagination: { total_count, current_page, total_pages, limit } }`
- **Excludes:** engine_number, chassis_number from list items

### `GET /api/vehicles/:external_id` — Vehicle detail
- **Auth:** Ops, Admin
- **Response:** Full vehicle object including `chassis_number`, `engine_number`, `status_history` array (all past status changes), `created_at`, `updated_at`
- **404** if not found

### `GET /api/dashboard/summary` — Aggregated metrics
- **Auth:** Ops, Admin
- **Cached:** 5-minute TTL (invalidated on vehicle upsert)
- **Response:** `{ total_vehicles, updated_today, ready_stock_count, delivered_count, by_status: {IN_TRANSIT: n, ...}, by_company: {code: n, ...}, by_branch: {code: n, ...}, top_5_models: [{model, count}], cache_timestamp }`
- All statuses always present (zero-count for empty ones)

### `GET /api/integration-logs` — Audit trail
- **Auth:** Admin only
- **Query params:** `page` (default 1), `limit` (default 50, max 500), `status` (success/failure), `external_id`, `date_from`, `date_to`, `company_code`
- **Response:** Log array sorted by `request_timestamp` desc. `request_payload_summary` excludes sensitive data.

### `GET /health` — Health check
- **Auth:** Public (no auth required)
- **Logic:** `SELECT 1` on PostgreSQL
- **200** if healthy: `{ status: "healthy", database: "connected", version, server_time, response_time_ms }`
- **503** if DB disconnected: `{ status: "unhealthy", database: "disconnected", ... }`

## Standard API Conventions

- **Success:** `{ success: true, message: "...", data: ... }` with optional `pagination` object
- **Error:** `{ success: false, message: "...", errors?: { field: ["msg"] } }`
- **Correlation ID:** Every request gets a UUID via `x-correlation-id` header
- **Timestamps:** Stored UTC in DB, ISO 8601 in API responses
- **Sensitive data:** engine_number and chassis_number excluded from logs and list views

## Authentication Model

Two credential types are accepted in the `Authorization: Bearer <token>` header:

**1. JWT (Phase 4)** — Pre-generated HS256 tokens with role in payload: `{ sub: "vehicle-stock-platform", role: "admin|ops|branch", iat, exp }`. Configured via `JWT_SECRET` + `JWT_ADMIN` / `JWT_OPS` / `JWT_BRANCH` in `.env`. Generate with `npm run jwt:generate`. See `PHASE4-JWT-AUTH.md` for full details.

**2. API Keys (legacy)** — Configured in `.env` as `API_KEYS="key1,key2"`. Format: `role:key` (e.g., `admin:secret-123,branch:test-key-1`). Without a role prefix, defaults to `branch` role.

If a token looks like a JWT (3 base64url parts), it takes the JWT verification path. Otherwise it falls through to API-key lookup.

## Key Design Patterns

1. **Idempotent upsert:** Match on `(external_id, company_code, branch_code)`. Create or update. Same input → same output. Every request has a `correlation_id`.

2. **Status history:** On every status change, insert into `vehicle_status_history` with previous/new status and timestamp. Append-only, never update/delete rows.

3. **Duplicate prevention:** Database unique constraint prevents exact duplicates. Chassis number global uniqueness check returns 409 on conflict with different external_id.

4. **Integration logging:** Every POST + every GET to /vehicles and /dashboard logs to `integration_log` with timing and sanitized payload. Fire-and-forget (log failures don't break the API response).

5. **Dashboard caching:** In-memory TTL cache (default 5 min). Invalidated on successful vehicle upsert. Cache timestamp returned in response.

## Environment Variables (`.env`)

| Variable | Required | Default | Notes |
|---|---|---|---|
| DATABASE_URL | Yes | — | PostgreSQL connection string |
| PORT | No | 6300 | Server port |
| NODE_ENV | No | development | development / production / test |
| API_KEYS | Yes | — | Comma-separated, optional `role:` prefix |
| JWT_SECRET | No (JWT disabled if absent) | — | HS256 secret for signing/verifying JWTs |
| JWT_ADMIN | No | — | Pre-generated JWT for admin role |
| JWT_OPS | No | — | Pre-generated JWT for ops role |
| JWT_BRANCH | No | — | Pre-generated JWT for branch role |
| LOG_LEVEL | No | info | error / warn / info / debug |
| CACHE_TTL | No | 300 | Dashboard cache seconds |
| APP_VERSION | No | 1.0.0 | Returned by /health |

## Phase Roadmap (from ROADMAP.md)

| Phase | Scope | Status |
|---|---|---|
| Phase 1 (6-8 wks) | POST /api/vehicles, /health, DB schema, status history, duplicate prevention, Docker | ✅ Implemented |
| Phase 2 (3-4 wks) | GET /api/vehicles, GET detail, /api/dashboard, /api/integration-logs, logging middleware | ✅ Implemented |
| Phase 3 (2-3 wks) | Advanced filtering, performance optimization, comprehensive tests, OpenAPI/Swagger docs | 🔲 Pending |
| Phase 4 (1 wk) | JWT + API-Key dual authentication, mini RBAC per role, `npm run jwt:generate` | ✅ Implemented |
| Phase 5 (1 wk) | Rate limiting (per-role × per-endpoint) + input validation hardening (sanitization, regex, business rules, size limits) | ✅ Implemented |

## Out of Scope (MVP)

No frontend (Nuxt is spec'd but not built). No WebSocket/real-time updates. No state machine validation on status transitions. No ML duplicate detection. No Kubernetes. No multi-tenancy. No bulk import/export. No email/SMS notifications.

## Common Tasks Reference

### Adding a new endpoint
1. Create Zod schema in `src/routes/schemas.ts`
2. Create service in `src/services/`
3. Create route file in `src/routes/` using `validate()` middleware + `authenticate()` for auth
4. Register route in `src/app.ts`
5. Add tests in `tests/integration/`

### Adding a new database table
1. Add model to `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Add seed data in `prisma/seed.ts`
4. Update `tests/helpers/db.ts` if needed (`cleanDatabase` ordering)

### Running a single test
```bash
npx jest --runInBand tests/integration/vehicles.test.ts -t "should create a new vehicle"
```

### Checking the database
```bash
npx prisma studio              # GUI
npx prisma db pull              # Introspect existing DB
```

## Files You Shouldn't Need to Touch

- `DATABASE.md`, `PRD.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `API.md` — Original spec docs. The code implements them. Only reference for questions of intent.
- `CLAUDE.md` — Subset of this file, specific to Claude Code.
- `node_modules/`, `dist/` — Generated.
