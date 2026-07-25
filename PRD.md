# PRD: Untitled Project

## Executive Summary & Product Vision

**Untitled Project** is a centralized Vehicle Stock Integration & Monitoring platform designed to aggregate vehicle inventory data from multiple branch operational systems into a single source of truth. The system enables real-time stock visibility, prevents data duplication, tracks vehicle status lifecycle, and provides comprehensive integration audit trails for multi-branch automotive operations.

**Core Value Proposition:**
- Unified vehicle inventory across distributed branches
- Automatic duplicate prevention via external_id + chassis_number matching
- Complete status change audit trail for compliance and analytics
- Real-time monitoring dashboard for operational decision-making
- Idempotent API design ensuring safe retry mechanisms

**Target Launch:** Production-ready with Docker containerization and health monitoring.

---

## Problem Statement & Target Users

**Problem:**
Multiple branch systems independently manage vehicle inventory without centralized visibility. Current state:
- No unified view of total stock across branches
- Manual reconciliation of duplicate entries
- Lost visibility into vehicle status transitions
- No audit trail for integration failures or data quality issues
- Operational inefficiency in stock allocation and monitoring

**Target Users:**

| User Role | Primary Need | Interaction Pattern |
|:---|:---|:---|
| **Operations Manager** | Real-time stock visibility across branches | Dashboard queries, filtering by company/branch/status |
| **Branch System Admin** | Reliable data transmission to central system | POST /api/vehicles integration, error handling |
| **Finance/Compliance Officer** | Integration audit trail and data quality metrics | Integration logs, status history reports |
| **System Integrator** | Predictable API contract and error responses | API documentation, idempotent retry logic |

---

## System Scope & User Roles

**In Scope (MVP):**
- Vehicle data ingestion from external branch systems
- Centralized PostgreSQL storage with Prisma ORM
- Duplicate prevention and status change tracking
- RESTful API for data submission and retrieval
- Monitoring dashboard with aggregated metrics
- Integration logging with audit trail
- Docker containerization with health checks
- Manual feedback matching (as per design decision)
- Flat-rate pricing model (as per design decision)

**User Roles & Permissions Matrix:**

| Role | POST /vehicles | GET /vehicles | GET /vehicles/{id} | GET /dashboard | GET /integration-logs | GET /health |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **External System (Branch)** | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Operations User** | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Admin/Integrator** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Public (Health)** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## Functional Requirements

### User-Facing (Branch Systems & Operations)

**FR-01: Vehicle Data Ingestion (POST /api/vehicles)**
- Accept JSON payload with vehicle attributes (external_id, company_code, branch_code, brand, model, year, color, chassis_number, engine_number, status, updated_at)
- Validate all required fields: external_id, chassis_number, company_code, branch_code, status
- Validate status against allowed enum: IN_TRANSIT, RECEIVED, READY_STOCK, BOOKED, DELIVERED, CANCELLED
- Validate ISO 8601 timestamp format for updated_at
- Return HTTP 400 with field-level error details if validation fails
- Implement idempotent upsert: if external_id + company_code + branch_code exists, update; otherwise create
- Detect status changes and record to status_history table with timestamp and previous_status
- Return HTTP 200 with success flag and processed external_id on success
- Return HTTP 409 if chassis_number conflicts with different external_id (data quality issue)
- Assign correlation_id to each request for traceability

**FR-02: Vehicle List with Filtering & Pagination (GET /api/vehicles)**
- Support pagination: query params page (default 1), limit (default 20, max 100)
- Support filters: company_code, branch_code, brand, model, status (multi-select), year_from, year_to
- Support search: chassis_number (exact or partial match)
- Support sorting: order_by (created_at, updated_at, brand, model), sort (asc, desc)
- Return paginated response with total_count, current_page, total_pages
- Include in response: external_id, brand, model, year, color, status, updated_at, branch_code
- Exclude sensitive fields (engine_number) from list view
- Return HTTP 200 with empty array if no matches

**FR-03: Vehicle Detail View (GET /api/vehicles/{external_id})**
- Return complete vehicle record including all attributes
- Include current_status and status_updated_at
- Include status_history array: [{status, changed_at, previous_status, changed_by}, ...]
- Include created_at (first received timestamp) and updated_at (last modified timestamp)
- Include branch_code and company_code for context
- Return HTTP 404 if external_id not found
- Return HTTP 200 with full vehicle object on success

**FR-04: Monitoring Dashboard (GET /api/dashboard/summary)**
- Return aggregated metrics without pagination
- Include: total_vehicles (count), updated_today (count of vehicles with updated_at >= today 00:00:00)
- Include by_status breakdown: {IN_TRANSIT: n, RECEIVED: n, READY_STOCK: n, BOOKED: n, DELIVERED: n, CANCELLED: n}
- Include by_company breakdown: {company_code: count, ...}
- Include by_branch breakdown: {branch_code: count, ...}
- Include top_5_models: [{model, count}, ...] sorted by count descending
- Include ready_stock_count and delivered_count as convenience metrics
- Cache results for 5 minutes to optimize database load
- Return HTTP 200 with summary object

**FR-05: Integration Audit Log (GET /api/integration-logs)**
- Support pagination: page, limit (default 50, max 500)
- Support filters: status (success/failure), external_id, date_from, date_to, company_code
- Return log entries with: correlation_id, request_timestamp, endpoint, http_method, external_id, success (boolean), http_status_code, error_message, processing_time_ms, request_payload_summary
- Exclude sensitive data from logs: engine_number, chassis_number (store hash only)
- Include processing_time_ms for performance monitoring
- Sort by request_timestamp descending (newest first)
- Return HTTP 200 with paginated log array

**FR-06: Health Check (GET /health)**
- Return JSON with: status (healthy/degraded/unhealthy), database (connected/disconnected), version (app version string), server_time (ISO 8601)
- Check database connectivity via simple query (SELECT 1)
- Return HTTP 200 if status=healthy, HTTP 503 if degraded/unhealthy
- Include response_time_ms for monitoring
- No authentication required; accessible to load balancers and monitoring systems

### Admin-Facing (System Management)

**FR-07: Status History Tracking**
- Automatically record every status change to status_history table
- Capture: vehicle_id, previous_status, new_status, changed_at, changed_by (system or user), change_reason (optional)
- Enable audit trail queries for compliance and analytics
- Prevent manual deletion of history records

**FR-08: Duplicate Prevention**
- Enforce unique constraint on (external_id, company_code, branch_code) to prevent exact duplicates
- Detect chassis_number conflicts: if same chassis_number exists with different external_id, log warning and return HTTP 409
- Allow same vehicle to be updated via same external_id (idempotent)
- Provide admin endpoint to review and resolve potential duplicates (out of scope for MVP but design for future)

**FR-09: Integration Logging**
- Log all POST /api/vehicles requests (success and failure)
- Capture: correlation_id, request_timestamp, endpoint, http_method, external_id, success, http_status_code, error_message, processing_time_ms, request_payload_summary
- Log all GET requests to /api/vehicles and /api/dashboard/summary for usage analytics
- Implement log retention policy: keep logs for 90 days, archive older logs
- Exclude sensitive fields from payload_summary (engine_number, chassis_number)

---

## Non-Functional Requirements

| Requirement | Target | Rationale |
|:---|:---|:---|
| **API Response Time (p95)** | < 500ms | Real-time dashboard queries must feel responsive |
| **API Response Time (p99)** | < 2s | Acceptable for batch operations and complex filters |
| **Database Query Time (p95)** | < 200ms | Optimize indexes on company_code, branch_code, status, chassis_number |
| **Throughput** | 1,000 req/sec | Support concurrent branch system submissions during peak hours |
| **Availability** | 99.5% uptime | SLA for operations team; acceptable 3.6 hours downtime/month |
| **Data Consistency** | Strong (ACID) | Vehicle status must never be inconsistent; use transactions for upserts |
| **Duplicate Prevention** | 100% | Zero tolerance for duplicate external_ids within same company/branch |
| **Idempotency** | Guaranteed | Identical requests must produce identical results; use correlation_id + request hash |
| **Concurrent Requests** | 100+ simultaneous | Handle multiple branches submitting data simultaneously |
| **Database Connections** | Connection pooling (min 5, max 20) | Optimize resource usage; prevent connection exhaustion |
| **Log Retention** | 90 days hot, archive older | Balance audit trail completeness with storage costs |
| **Cache TTL** | 5 minutes (dashboard) | Balance freshness with database load reduction |
| **Security: API Authentication** | Auth.js (NextAuth) | Secure branch system access; prevent unauthorized data submission |
| **Security: Data Encryption** | TLS 1.3 in transit; at-rest encryption optional | Protect sensitive vehicle data in transmission |
| **Security: Input Validation** | Strict schema validation | Prevent injection attacks and malformed data |
| **Scalability: Horizontal** | Stateless API design | Enable load balancing across multiple instances |
| **Scalability: Vertical** | PostgreSQL connection pooling | Support growth without architectural changes (up to 10M vehicles) |
| **Monitoring** | Health check every 30s | Detect failures and enable auto-recovery |
| **Observability** | Structured logging (JSON) | Enable log aggregation and analysis |

---

## Technology Stack & Rationale

| Component | Technology | Why |
|:---|:---|:---|
| **Backend Runtime** | Node.js (LTS) | Async I/O for high-throughput API; matches frontend ecosystem (Nuxt) |
| **Backend Framework** | Express.js or Fastify | Lightweight, battle-tested; Fastify for higher throughput if needed |
| **ORM** | Prisma | Type-safe queries; automatic migrations; matches user's PostgreSQL + Prisma choice |
| **Database** | PostgreSQL 15+ | ACID compliance for data consistency; JSON support for flexible vehicle attributes; proven at scale |
| **Authentication** | Auth.js (NextAuth) | User's chosen stack; seamless integration with Nuxt frontend; OAuth2 support |
| **Frontend** | Nuxt 3 (Vue.js) | User's chosen stack; SSR for dashboard; unified tech stack |
| **Styling** | Tailwind CSS v4 | User's chosen stack; rapid UI development for dashboard |
| **Containerization** | Docker + Docker Compose | Reproducible environments; multi-container orchestration (app + db) |
| **API Documentation** | OpenAPI 3.0 + Swagger UI | Auto-generated docs; branch systems can self-integrate |
| **Logging** | Winston or Pino | Structured JSON logging; integrates with log aggregation tools |
| **Validation** | Zod or Joi | Schema validation; type inference; clear error messages |
| **Testing** | Jest + Supertest | Unit and integration tests; API endpoint testing |
| **CI/CD** | GitHub Actions (assumed) | Automated testing and Docker image builds on push |
| **Monitoring** | Prometheus + Grafana (optional) | Metrics collection; dashboard for ops team |
| **Cache** | Redis (optional for MVP) | In-memory caching for dashboard summary; reduces database load |

---

## Success Metrics & KPIs

| Metric | Target | Measurement Method | Owner |
|:---|:---|:---|:---|
| **Data Ingestion Success Rate** | ≥ 99.5% | (successful_requests / total_requests) × 100 | Ops |
| **Duplicate Prevention Effectiveness** | 100% | Count of duplicate external_ids detected / total ingestion attempts | Ops |
| **API Response Time (p95)** | < 500ms | Prometheus histogram; dashboard query latency | Eng |
| **Dashboard Load Time** | < 2s | Frontend performance monitoring; Lighthouse score ≥ 80 | Eng |
| **System Availability** | ≥ 99.5% | Uptime monitoring; (total_time - downtime) / total_time | Ops |
| **Data Freshness** | ≤ 5 min | Max age of dashboard summary cache | Eng |
| **Integration Log Completeness** | 100% | All POST requests logged; audit trail coverage | Compliance |
| **Concurrent User Capacity** | ≥ 100 simultaneous | Load testing; concurrent request handling | Eng |
| **Database Query Optimization** | p95 < 200ms | Query execution time; index hit rate ≥ 95% | Eng |
| **Error Message Clarity** | ≥ 90% self-resolution | Support ticket analysis; users resolve issues without escalation | Support |
| **Idempotency Guarantee** | 100% | Replay identical requests; verify identical responses | QA |
| **Cost per Request** | < $0.001 | Infrastructure cost / total requests | Finance |

---

## Risk Analysis & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|:---|:---|:---|:---|
| **Data Duplication Despite Prevention** | High: Corrupted analytics, incorrect stock counts | Medium | Implement unique constraint on (external_id, company_code, branch_code); add chassis_number conflict detection; weekly audit queries to detect orphaned duplicates |
| **API Overload During Peak Hours** | High: Service degradation, branch systems timeout | Medium | Implement rate limiting (100 req/sec per branch); use connection pooling; horizontal scaling with load balancer; queue non-critical requests |
| **Database Connection Exhaustion** | High: API becomes unresponsive | Low | Configure connection pool (min 5, max 20); monitor active connections; implement connection timeout; add alerts at 80% capacity |
| **Status History Table Growth** | Medium: Query slowdown, storage costs | High | Implement partitioning by month; archive old records after 90 days; add index on (vehicle_id, changed_at); monitor table size weekly |
| **Idempotency Failure (Duplicate Processing)** | High: Double-counted vehicles, incorrect status | Medium | Store correlation_id + request hash; check before processing; use database transactions; implement replay detection |
| **Timezone Handling Errors** | Medium: Incorrect timestamps, reporting discrepancies | Medium | Enforce UTC storage; convert to +07:00 (Asia/Jakarta) only in API responses; validate ISO 8601 format on input |
| **Sensitive Data Leakage in Logs** | High: Compliance violation, security breach | Low | Exclude engine_number, chassis_number from logs; hash sensitive fields; implement log sanitization middleware; audit logs quarterly |
| **External System Integration Failures** | Medium: Incomplete data sync, branch visibility loss | Medium | Implement retry logic (exponential backoff); provide detailed error messages; log all failures; alert ops team on repeated failures |
| **Dashboard Cache Staleness** | Low: Outdated metrics, incorrect decisions | Low | Set TTL to 5 minutes; implement cache invalidation on data changes; provide manual refresh button; show cache timestamp in UI |
| **PostgreSQL Backup Failure** | Critical: Data loss, unrecoverable state | Low | Implement automated daily backups; test restore procedure monthly; maintain 30-day backup retention; use managed database service (RDS/Cloud SQL) |

---

## Constraints & Assumptions

**Constraints:**
- Single PostgreSQL database (no sharding in MVP; design for future horizontal scaling)
- Synchronous API responses (no async job queue in MVP; add Bull/RabbitMQ if throughput exceeds 1,000 req/sec)
- Manual feedback matching (as per design decision; no ML-based duplicate detection)
- Flat-rate pricing model (as per design decision; no usage-based billing)
- Docker Compose for local/staging; Kubernetes for production (out of scope for MVP)
- No real-time WebSocket updates (polling-based dashboard refresh acceptable)
- Auth.js authentication required for all endpoints except /health (branch systems must authenticate)

**Assumptions:**
- Branch systems will send valid ISO 8601 timestamps in +07:00 timezone
- External_id is globally unique within company (enforced by branch systems)
- Chassis_number is globally unique across all vehicles (industry standard)
- Company_code and branch_code are pre-configured in system (no self-service registration in MVP)
- Vehicle status transitions follow logical flow (no validation of state machine in MVP; add in v2)
- Dashboard queries are read-only; no direct database writes from frontend
- PostgreSQL 15+ is available (supports JSON, advanced indexing)
- Docker and Docker Compose are available in deployment environment
- Network latency between branch systems and central API is < 5 seconds

---

## Out of Scope (MVP)

**Explicitly NOT included in this version:**

- **User Management UI:** Admin panel for managing users, roles, permissions (use Auth.js defaults)
- **State Machine Validation:** Enforce logical status transitions (e.g., BOOKED → READY_STOCK not allowed); add in v2
- **ML-Based Duplicate Detection:** Fuzzy matching on vehicle attributes; implement after MVP
- **Real-Time WebSocket Updates:** Dashboard uses polling; WebSocket support in v2
- **Kubernetes Orchestration:** Docker Compose only; K8s deployment in v2
- **Advanced Analytics:** Trend analysis, forecasting, predictive stock levels; add in v2
- **Multi-Tenancy:** Single company deployment; multi-tenant architecture in v2
- **Audit Trail UI:** Compliance officers view logs via API only; dedicated UI in v2
- **Bulk Import/Export:** CSV upload/download; implement after MVP
- **Vehicle Photo Storage:** No image handling; add in v2
- **SMS/Email Notifications:** No alerting system; add in v2
- **Payment Integration:** Flat-rate model only; billing system in v2
- **Mobile App:** Web-only (Nuxt SSR); mobile app in v2
- **Offline Mode:** Always-online assumption; offline sync in v2
- **Custom Reports:** Fixed dashboard only; report builder in v2
- **API Rate Limiting UI:** Rate limits enforced; no admin panel to adjust in MVP
- **Database Replication:** Single database; replication for HA in v2

---

**Document Version:** 1.0  
**Last Updated:** 2026-07-20  
**Status:** Ready for Development