# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vehicle Stock Integration & Monitoring platform — a centralized system that aggregates vehicle inventory data from multiple branch operational systems into a single source of truth. See `PRD.md` for full product requirements, `API.md` for endpoint specs, `DATABASE.md` for schema design.

**Tech stack:** Node.js (LTS) + Express.js/Fastify, Prisma ORM, PostgreSQL 15+, Nuxt 3 (Vue.js) + Tailwind CSS v4, Auth.js (NextAuth), Docker + Docker Compose.

## Common Commands

```bash
# Development
npm install
npm run dev                # Start dev server (backend)
npm run dev:frontend       # Start Nuxt dev server (if separate workspace)
npm run build              # Production build

# Database (Prisma)
npx prisma generate        # Generate Prisma client from schema
npx prisma migrate dev     # Create and apply migrations
npx prisma db push         # Push schema to DB without migrations
npx prisma studio          # Open Prisma Studio GUI
npx prisma db seed         # Seed database with sample companies/branches
npm run db:seed            # Alternative via package.json script

# Testing
npm test                   # Run all tests (Jest + Supertest)
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage (target >80% on critical paths)

# Linting & Formatting
npm run lint               # Run linter
npm run format             # Run formatter

# Docker
docker-compose up -d       # Start app + PostgreSQL containers
docker-compose down        # Stop containers
docker-compose logs -f     # Tail logs from all containers

# Auth (Phase 4: JWT)
npm run jwt:generate       # Generate JWT tokens for all roles
npm run jwt:generate -- --write  # Generate and write to .env
```

## Architecture

### Data Flow

```
Branch Systems ──POST /api/vehicles──▶ Express/Fastify API ──Prisma──▶ PostgreSQL
                                              │
                          ┌───────────────────┼───────────────────┐
                          ▼                   ▼                   ▼
                   /api/vehicles        /api/dashboard       /api/integration-logs
                   (CRUD + search)      (aggregated metrics)  (audit trail)
                                              │
                          Nuxt 3 Frontend ◀───┘
```

### Database Schema (5 tables)

| Table | Purpose | Key constraints |
|---|---|---|
| `company` | Lookup table for company codes | PK on `code` |
| `branch` | Lookup linked to company | PK on `code`, FK to `company` |
| `vehicle` | Core inventory | Unique on `(external_id, company_code, branch_code)`, unique on `chassis_number` |
| `vehicle_status_history` | Immutable audit trail of status changes | FK to `vehicle`, no direct API deletes |
| `integration_log` | All API request logs (success + failure) | Unique `correlation_id`, 90-day retention |

Full Prisma schema is in `DATABASE.md:200-303`. Use `@map` to keep JS camelCase while DB columns are snake_case.

### API Endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/vehicles` | POST | Branch/Admin | Idempotent upsert, detects status changes + chassis conflicts |
| `/api/vehicles` | GET | Ops/Admin | Paginated list with filtering, search, sorting |
| `/api/vehicles/:external_id` | GET | Ops/Admin | Detail view including full status history |
| `/api/dashboard/summary` | GET | Ops/Admin | Aggregated metrics, 5-min cache TTL |
| `/api/integration-logs` | GET | Admin only | Paginated audit log, 90-day retention |
| `/health` | GET | Public | DB connectivity check, version, server time |

### Standard API Response Format

All endpoints use a consistent wrapper:
```json
{ "success": true, "message": "...", "data": { ... } }
```

Paginated endpoints include:
```json
{ "pagination": { "total_count": 100, "current_page": 1, "total_pages": 5, "limit": 20 } }
```

Validation errors (`400`):
```json
{ "success": false, "message": "Validation failed", "errors": { "field_name": ["Error message"] } }
```

### Key Design Patterns

**Idempotent Upsert (POST /api/vehicles):** Match on `(external_id, company_code, branch_code)`. If exists → update; otherwise → create. Same request replayed produces identical result. Every request gets a `correlation_id` for traceability.

**Status History Tracking:** On every vehicle status change, insert a row into `vehicle_status_history` with `previous_status`, `new_status`, `changed_at`, `changed_by`. History is append-only — never update or delete rows.

**Duplicate Prevention:** Two layers: (1) database unique constraint on `(external_id, company_code, branch_code)` prevents exact duplicates; (2) `chassis_number` uniqueness check — return `409 Conflict` if chassis matches a different `external_id`.

**Integration Logging:** Log every POST to `/api/vehicles` with `correlation_id`, `processing_time_ms`, success/failure, and a sanitized payload summary. Also log GETs to `/api/vehicles` and `/api/dashboard/summary` for usage analytics.

## Key Conventions

- **Timestamps:** Store in UTC. Convert to `+07:00` (Asia/Jakarta) only at the API response layer. Validate ISO 8601 format with timezone offset on input.
- **Sensitive data in logs:** Exclude `engine_number` and `chassis_number` from `request_payload_summary`. Store only hashed values if needed for matching.
- **Prisma conventions:** camelCase in the Prisma schema JS side, snake_case in the database via `@map()` and `@@map()`.
- **Primary keys:** Use `@default(cuid())` for all tables (not auto-increment integers or UUIDv4).
- **Vehicle status enum:** `IN_TRANSIT`, `RECEIVED`, `READY_STOCK`, `BOOKED`, `DELIVERED`, `CANCELLED`. No state machine validation in MVP — branch systems are responsible for sending valid transitions.
- **Dashboard cache:** 5-minute TTL. Invalidate on successful POST to `/api/vehicles`. Show `cache_timestamp` in response.
- **Pagination defaults:** `GET /api/vehicles` — page 1, limit 20 (max 100). `GET /api/integration-logs` — page 1, limit 50 (max 500).
- **Log retention:** 90 days hot storage, archive to cold storage for up to 1 year.
- **Connection pool:** min 5, max 20. Alert at 80% capacity (16 connections).
- **Auth (Phase 4):** Both JWT (Authorization: Bearer) + API-key (X-API-Key) are mandatory on all protected endpoints. JWTs are HS256 with signed role claims. See `PHASE4-JWT-AUTH.md`.

## Project Phases (from ROADMAP.md)

| Phase | Duration | Focus |
|---|---|---|
| Phase 1 | 6-8 weeks | POST /api/vehicles, GET /health, DB schema, status history, duplicate prevention, basic Docker |
| Phase 2 | 3-4 weeks | GET list/detail/dashboard/integration-logs, logging middleware |
| Phase 3 | 2-3 weeks | Advanced filtering, performance optimization, comprehensive tests, API docs (Swagger) |
| Phase 4 | 1 week | JWT + API-Key dual auth, mini RBAC (see `PHASE4-JWT-AUTH.md`) |
| Phase 5 | 1 week | Rate limiting (per-role × per-endpoint) + input validation hardening (sanitization, stricter formats, business rules, request size/content-type enforcement) |

## Expected Project Structure

```
/
├── prisma/
│   ├── schema.prisma          # From DATABASE.md:200-303
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── server.ts              # Express/Fastify entry point
│   ├── routes/
│   │   ├── vehicles.ts        # POST + GET /api/vehicles, GET /api/vehicles/:id
│   │   ├── dashboard.ts       # GET /api/dashboard/summary
│   │   ├── integration-logs.ts # GET /api/integration-logs
│   │   └── health.ts          # GET /health
│   ├── middleware/
│   │   ├── auth.ts            # Auth.js verification
│   │   ├── validation.ts      # Zod/Joi schema validation
│   │   ├── correlation-id.ts  # Attach correlation_id to requests
│   │   └── logger.ts          # Request/response logging (Winston/Pino)
│   ├── services/
│   │   ├── vehicle.service.ts # Upsert logic, status change detection
│   │   ├── dashboard.service.ts # Aggregation queries with caching
│   │   └── integration-log.service.ts # Log creation and query
│   └── lib/
│       ├── prisma.ts          # Prisma client singleton
│       ├── cache.ts           # In-memory cache (or Redis client)
│       └── errors.ts          # Custom error classes (ValidationError, ConflictError, NotFoundError)
├── frontend/                  # Nuxt 3 application
│   ├── pages/
│   ├── components/
│   └── composables/
├── tests/
│   ├── unit/
│   └── integration/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```
