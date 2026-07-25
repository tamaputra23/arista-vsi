# ROADMAP.md: Untitled Project

## Phased Delivery Plan

This roadmap outlines the planned phases for the "Untitled Project" (Vehicle Stock Integration & Monitoring platform). Each phase builds upon the previous one, delivering core functionality incrementally.

| Phase | Duration | Goals |
|:---|:---|:---|
| **Phase 1: Core Ingestion & Foundation** | 6-8 weeks | Establish core data model, implement robust vehicle data ingestion API with duplicate prevention and status history tracking. Ensure basic health monitoring and containerization. |
| **Phase 2: Monitoring & Audit** | 3-4 weeks | Develop APIs for listing vehicles, retrieving detailed vehicle information with status history, and providing a comprehensive monitoring dashboard. Implement detailed integration logging. |
| **Phase 3: Refinement & Hardening** | 2-3 weeks | Enhance API capabilities with advanced filtering/sorting, optimize performance, implement comprehensive testing, and finalize deployment automation for production readiness. |

*Disclaimer: Timeline assumes a team of 3-4 developers. Adjust proportionally for different team sizes.*

## MVP Feature List

Features are categorized by priority for phased delivery, referencing Functional Requirements (FR-XX) from `PRD.md`.

### P0 (Must Have for launch)

These features are critical for the initial launch and provide the fundamental data ingestion capabilities.

*   **FR-01: Vehicle Data Ingestion (POST /api/vehicles)**: Core API for receiving vehicle data, including validation, upsert logic, and status change detection.
*   **FR-06: Health Check (GET /health)**: Endpoint to monitor application and database status.
*   **FR-07: Status History Tracking**: Automatic recording of all vehicle status changes.
*   **FR-08: Duplicate Prevention**: Mechanisms to prevent data duplication and handle chassis number conflicts.
*   **Basic Docker Setup**: `Dockerfile`, `docker-compose.yml`, `.env.example` for application and database containers.

### P1 (Should Have within 1 month post-launch)

These features enhance operational visibility and provide essential audit capabilities shortly after launch.

*   **FR-02: Vehicle List with Filtering & Pagination (GET /api/vehicles)**: API for retrieving a paginated list of vehicles with basic filtering (company, branch, status) and sorting.
*   **FR-03: Vehicle Detail View (GET /api/vehicles/{external_id})**: API to fetch a single vehicle's full details, including its status history.
*   **FR-04: Monitoring Dashboard (GET /api/dashboard/summary)**: API providing aggregated vehicle stock metrics.
*   **FR-05: Integration Audit Log (GET /api/integration-logs)**: API to retrieve paginated integration logs with filtering.
*   **FR-09: Integration Logging**: Backend process to capture detailed logs for all data ingestion attempts.
*   **Refined Docker Setup**: Inclusion of a health check container and persistent database volume configuration.

### P2 (Nice to Have for future)

These features represent further enhancements and optimizations that can be implemented post-MVP.

*   Advanced filtering and search capabilities for FR-02 and FR-05 (e.g., date ranges, partial chassis number search).
*   Performance optimizations beyond initial caching strategies.
*   Comprehensive end-to-end test suite.
*   Detailed API documentation (OpenAPI/Swagger UI generation).

## Milestones

| Milestone | Phase | Target Date | Deliverables |
|:---|:---|:---|:---|
| **M1: Core Ingestion API Ready** | Phase 1 | Week 8 | Functional `POST /api/vehicles` endpoint, `GET /health` endpoint, database schema for vehicles and status history, duplicate prevention logic, basic Docker setup. |
| **M2: Monitoring & Audit APIs Ready** | Phase 2 | Week 12 | Functional `GET /api/vehicles` (list), `GET /api/vehicles/{id}` (detail), `GET /api/dashboard/summary`, `GET /api/integration-logs` endpoints, integration logging implemented, refined Docker setup. |
| **M3: Production Readiness** | Phase 3 | Week 15 | All P0 & P1 features implemented, performance benchmarks met, comprehensive unit/integration tests, deployment scripts, initial API documentation. |

## Dependencies

### External Dependencies

*   **Auth.js (NextAuth) Integration**: Required for API authentication and authorization.
*   **PostgreSQL Database**: A running instance of PostgreSQL 15+ for data storage.
*   **Docker Environment**: Docker and Docker Compose installed on development and deployment machines.
*   **Branch System API Specifications**: Clear understanding of how external branch systems will consume and integrate with the platform's API.

### Internal Dependencies

*   **Database Schema Design**: Finalized schema for `vehicles`, `status_history`, and `integration_logs` tables.
*   **API Specification**: Detailed OpenAPI 3.0 specification for all endpoints.
*   **Security Guidelines**: Adherence to internal security policies for data handling and access.
*   **Logging Configuration**: Standardized logging format and aggregation strategy.

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|:---|:---|:---|:---|
| **Data Duplication Despite Prevention** | High | Medium | Implement unique constraint on (external_id, company_code, branch_code); add chassis_number conflict detection; weekly audit queries to detect orphaned duplicates. |
| **API Overload During Peak Hours** | High | Medium | Implement rate limiting (e.g., 100 req/sec per branch); use connection pooling; design for horizontal scaling with load balancer; queue non-critical requests if necessary. |
| **Database Connection Exhaustion** | High | Low | Configure connection pool (min 5, max 20); monitor active connections; implement connection timeout; add alerts at 80% capacity. |
| **Status History Table Growth** | Medium | High | Implement partitioning by month; archive old records after 90 days; add index on (vehicle_id, changed_at); monitor table size weekly. |
| **Idempotency Failure (Duplicate Processing)** | High | Medium | Store correlation_id + request hash; check before processing; use database transactions; implement replay detection. |
| **Sensitive Data Leakage in Logs** | High | Low | Exclude `engine_number`, `chassis_number` from logs; hash sensitive fields; implement log sanitization middleware; audit logs quarterly. |