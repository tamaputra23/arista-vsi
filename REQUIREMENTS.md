# REQUIREMENTS.md: Untitled Project

## Functional Requirements

### User-Facing Module

#### FR-01: Vehicle Data Ingestion

The system SHALL provide an API endpoint to receive and process vehicle data from external branch systems.

*   **FR-01.1:** The system MUST expose a `POST /api/vehicles` endpoint.
    *   Acceptance Criteria: A `POST` request to `/api/vehicles` with a valid JSON payload SHALL return an HTTP 200 status code.
    *   Acceptance Criteria: The API endpoint SHALL be accessible only to authenticated external systems.
*   **FR-01.2:** The system MUST validate all incoming request fields.
    *   Acceptance Criteria: Requests missing `external_id`, `chassis_number`, `company_code`, or `branch_code` SHALL return an HTTP 400 status code with a specific error message for the missing field.
    *   Acceptance Criteria: The `status` field MUST be one of `IN_TRANSIT`, `RECEIVED`, `READY_STOCK`, `BOOKED`, `DELIVERED`, or `CANCELLED`. Any other value SHALL result in an HTTP 400 error.
    *   Acceptance Criteria: The `updated_at` field MUST be a valid ISO 8601 timestamp (e.g., `2026-07-20T10:30:00+07:00`). Invalid formats SHALL return an HTTP 400 error.
*   **FR-01.3:** The system MUST implement an idempotent upsert mechanism for vehicle data.
    *   Acceptance Criteria: If a vehicle with the same `external_id`, `company_code`, and `branch_code` already exists, the system SHALL update its attributes.
    *   Acceptance Criteria: If no such vehicle exists, the system SHALL create a new vehicle record.
    *   Acceptance Criteria: Sending the exact same request multiple times SHALL result in the same final state and return HTTP 200 for subsequent identical requests.
*   **FR-01.4:** The system MUST detect and record changes in vehicle status.
    *   Acceptance Criteria: When the `status` field in an incoming request differs from the current stored status for an existing vehicle, the system SHALL create a new entry in the `status_history` table.
    *   Acceptance Criteria: Each `status_history` entry SHALL include the `vehicle_id`, `previous_status`, `new_status`, and `changed_at` timestamp.
*   **FR-01.5:** The system MUST prevent data duplication based on `chassis_number`.
    *   Acceptance Criteria: If an incoming `chassis_number` already exists for a *different* `external_id` (i.e., not the one being updated or created), the system SHALL return an HTTP 409 Conflict status code with an appropriate error message.
    *   Acceptance Criteria: The system SHALL log a warning for any `chassis_number` conflict detected.
*   **FR-01.6:** The system MUST provide clear API responses for success and failure.
    *   Acceptance Criteria: A successful request SHALL return an HTTP 200 status code with a JSON body `{ "success": true, "message": "Vehicle data processed successfully", "data": { "external_id": "ADMS-000123", "status": "READY_STOCK" } }`.
    *   Acceptance Criteria: A failed validation request SHALL return an HTTP 400 status code with a JSON body `{ "success": false, "message": "Validation failed", "errors": { "chassis_number": [ "Chassis number is required" ] } }`.
    *   Acceptance Criteria: Each request SHALL be assigned a `correlation_id` for traceability, included in logs.

#### FR-02: Vehicle List Retrieval

The system SHALL provide an API endpoint to retrieve a paginated list of vehicles with filtering and search capabilities.

*   **FR-02.1:** The system MUST expose a `GET /api/vehicles` endpoint.
    *   Acceptance Criteria: A `GET` request to `/api/vehicles` SHALL return a paginated list of vehicle records.
    *   Acceptance Criteria: The endpoint SHALL support `page` (default 1) and `limit` (default 20, max 100) query parameters for pagination.
*   **FR-02.2:** The system MUST support filtering vehicles based on various criteria.
    *   Acceptance Criteria: The endpoint SHALL support filtering by `company_code`, `branch_code`, `brand`, `model`, and `status` (allowing multiple status values).
    *   Acceptance Criteria: The endpoint SHALL support filtering by `year_from` and `year_to` to specify a range.
*   **FR-02.3:** The system MUST support searching by `chassis_number`.
    *   Acceptance Criteria: The endpoint SHALL allow searching for vehicles by `chassis_number` using exact or partial matching.
*   **FR-02.4:** The system MUST support sorting the vehicle list.
    *   Acceptance Criteria: The endpoint SHALL support sorting by `updated_at` (default), `created_at`, `brand`, or `model` using `order_by` and `sort` (asc/desc) query parameters.
*   **FR-02.5:** The system MUST return a structured response for the vehicle list.
    *   Acceptance Criteria: The response SHALL include `total_count`, `current_page`, `total_pages`, and an array of vehicle objects.
    *   Acceptance Criteria: Each vehicle object in the list SHALL include `external_id`, `brand`, `model`, `year`, `color`, `status`, `updated_at`, and `branch_code`. Sensitive fields like `engine_number` SHALL be excluded.
    *   Acceptance Criteria: If no vehicles match the criteria, an HTTP 200 status with an empty array and appropriate pagination metadata SHALL be returned.

#### FR-03: Vehicle Detail Retrieval

The system SHALL provide an API endpoint to retrieve detailed information for a specific vehicle, including its status history.

*   **FR-03.1:** The system MUST expose a `GET /api/vehicles/{external_id}` endpoint.
    *   Acceptance Criteria: A `GET` request to `/api/vehicles/ADMS-000123` SHALL return a single vehicle record if found.
*   **FR-03.2:** The system MUST return comprehensive vehicle data.
    *   Acceptance Criteria: The response SHALL include all vehicle attributes: `external_id`, `company_code`, `branch_code`, `brand`, `model`, `year`, `color`, `chassis_number`, `engine_number`, `status`, `updated_at`.
    *   Acceptance Criteria: The response SHALL also include `created_at` (timestamp of first reception) and the current `status_updated_at` timestamp.
*   **FR-03.3:** The system MUST include the full status change history for the vehicle.
    *   Acceptance Criteria: The response SHALL contain an array named `status_history`, where each entry includes `status`, `changed_at`, `previous_status`, and `changed_by` (e.g., 'system').
*   **FR-03.4:** The system MUST handle cases where the vehicle is not found.
    *   Acceptance Criteria: If no vehicle matches the provided `external_id`, the system SHALL return an HTTP 404 Not Found status code.

#### FR-04: Monitoring Dashboard Summary

The system SHALL provide an API endpoint to retrieve aggregated vehicle stock metrics for monitoring purposes.

*   **FR-04.1:** The system MUST expose a `GET /api/dashboard/summary` endpoint.
    *   Acceptance Criteria: A `GET` request to `/api/dashboard/summary` SHALL return a JSON object containing various aggregated counts.
*   **FR-04.2:** The system MUST provide key summary metrics.
    *   Acceptance Criteria: The response SHALL include `total_vehicles` (total count of all vehicles).
    *   Acceptance Criteria: The response SHALL include `updated_today` (count of vehicles with `updated_at` on the current day, UTC).
    *   Acceptance Criteria: The response SHALL include `ready_stock_count` and `delivered_count` as direct metrics.
*   **FR-04.3:** The system MUST provide breakdowns by status, company, and branch.
    *   Acceptance Criteria: The response SHALL include a `by_status` object, detailing counts for each allowed status (e.g., `{ "IN_TRANSIT": 10, "READY_STOCK": 55 }`).
    *   Acceptance Criteria: The response SHALL include a `by_company` object, detailing counts per `company_code` (e.g., `{ "PT-AKA": 65 }`).
    *   Acceptance Criteria: The response SHALL include a `by_branch` object, detailing counts per `branch_code` (e.g., `{ "JKT01": 30 }`).
*   **FR-04.4:** The system MUST identify top models.
    *   Acceptance Criteria: The response SHALL include `top_5_models`, an array of objects `[{ "model": "Creta", "count": 20 }]`, sorted by count in descending order.
*   **FR-04.5:** The system SHOULD cache dashboard results.
    *   Acceptance Criteria: The dashboard summary data SHOULD be cached for 5 minutes to reduce database load.

#### FR-05: Integration Log Retrieval

The system SHALL provide an API endpoint to retrieve a paginated list of integration logs for audit and troubleshooting.

*   **FR-05.1:** The system MUST expose a `GET /api/integration-logs` endpoint.
    *   Acceptance Criteria: A `GET` request to `/api/integration-logs` SHALL return a paginated list of integration log entries.
    *   Acceptance Criteria: The endpoint SHALL support `page` and `limit` (default 50, max 500) query parameters for pagination.
*   **FR-05.2:** The system MUST support filtering integration logs.
    *   Acceptance Criteria: The endpoint SHALL support filtering by `status` (success/failure), `external_id`, `date_from`, `date_to`, and `company_code`.
*   **FR-05.3:** The system MUST return detailed log entries.
    *   Acceptance Criteria: Each log entry SHALL include `correlation_id`, `request_timestamp`, `endpoint`, `http_method`, `external_id`, `success` (boolean), `http_status_code`, `error_message` (if any), `processing_time_ms`, and `request_payload_summary`.
    *   Acceptance Criteria: Log entries SHALL be sorted by `request_timestamp` in descending order (newest first).
*   **FR-05.4:** The system MUST prevent sensitive data exposure in logs.
    *   Acceptance Criteria: The `request_payload_summary` field SHALL NOT contain sensitive data such as `engine_number` or `chassis_number`.

#### FR-06: Health Check

The system SHALL provide a public API endpoint to check the application's health and status.

*   **FR-06.1:** The system MUST expose a `GET /health` endpoint.
    *   Acceptance Criteria: A `GET` request to `/health` SHALL return a JSON object indicating the system's operational status.
    *   Acceptance Criteria: This endpoint SHALL NOT require authentication.
*   **FR-06.2:** The system MUST report on critical components.
    *   Acceptance Criteria: The response SHALL include `status` (e.g., "healthy", "degraded", "unhealthy"), `database` connection status (e.g., "connected", "disconnected"), `version` (application version string), and `server_time` (current server time in ISO 8601 format).
    *   Acceptance Criteria: The `database` status SHALL be determined by a simple query (e.g., `SELECT 1`) to the database.
*   **FR-06.3:** The system MUST indicate overall health via HTTP status.
    *   Acceptance Criteria: If `status` is "healthy", the endpoint SHALL return an HTTP 200 status code.
    *   Acceptance Criteria: If `status` is "degraded" or "unhealthy", the endpoint SHALL return an HTTP 503 Service Unavailable status code.
    *   Acceptance Criteria: The response SHALL include `response_time_ms` indicating the health check's execution duration.

### Admin-Facing Module

#### FR-07: Status History Tracking

The system SHALL automatically maintain a comprehensive audit trail of all vehicle status changes.

*   **FR-07.1:** The system MUST automatically record every status change.
    *   Acceptance Criteria: Any update to a vehicle's `status` field SHALL trigger the creation of a new record in the `status_history` table.
    *   Acceptance Criteria: Each `status_history` record SHALL include the `vehicle_id`, `previous_status`, `new_status`, `changed_at` timestamp, and `changed_by` (e.g., 'system').
*   **FR-07.2:** The system MUST ensure the integrity of status history.
    *   Acceptance Criteria: `status_history` records SHALL NOT be directly modifiable or deletable via API or standard application flows.

#### FR-08: Duplicate Prevention Logic

The system SHALL enforce strict rules to prevent duplicate vehicle records and manage `chassis_number` conflicts.

*   **FR-08.1:** The system MUST enforce uniqueness for primary vehicle identifiers.
    *   Acceptance Criteria: The combination of `external_id`, `company_code`, and `branch_code` SHALL be unique for each vehicle record in the database.
*   **FR-08.2:** The system MUST detect and report `chassis_number` conflicts.
    *   Acceptance Criteria: If an incoming `chassis_number` matches an existing `chassis_number` associated with a *different* `external_id` (or `company_code`/`branch_code` combination), the system SHALL reject the request with an HTTP 409 Conflict.
    *   Acceptance Criteria: The system SHALL log details of `chassis_number` conflicts for review.

#### FR-09: Integration Logging

The system SHALL maintain detailed logs for all integration activities, particularly for vehicle data ingestion.

*   **FR-09.1:** The system MUST log all `POST /api/vehicles` requests.
    *   Acceptance Criteria: Every attempt to submit vehicle data, regardless of success or failure, SHALL be recorded in the integration logs.
    *   Acceptance Criteria: Log entries SHALL include `correlation_id`, `request_timestamp`, `endpoint`, `http_method`, `external_id`, `success` (boolean), `http_status_code`, `error_message` (if applicable), `processing_time_ms`, and a `request_payload_summary`.
*   **FR-09.2:** The system MUST log all `GET` requests to `/api/vehicles` and `/api/dashboard/summary`.
    *   Acceptance Criteria: All successful and failed retrieval requests to these endpoints SHALL be logged for usage analytics and auditing.
*   **FR-09.3:** The system MUST protect sensitive data in logs.
    *   Acceptance Criteria: The `request_payload_summary` SHALL be sanitized to exclude sensitive fields such as `engine_number` and `chassis_number`.
*   **FR-09.4:** The system MUST implement a log retention policy.
    *   Acceptance Criteria: Integration logs SHALL be retained in an accessible state for a minimum of 90 days.

## Non-Functional Requirements

| Category | Requirement | Measurable Target |
|:---|:---|:---|
| **Performance** | API Response Time (p95) for `POST /api/vehicles` | < 500ms |
| **Performance** | API Response Time (p99) for `POST /api/vehicles` | < 2s |
| **Performance** | API Response Time (p95) for `GET /api/vehicles` | < 300ms |
| **Performance** | API Response Time (p95) for `GET /api/dashboard/summary` | < 500ms (cached) |
| **Performance** | Database Query Time (p95) for critical queries | < 200ms |
| **Scalability** | Throughput for `POST /api/vehicles` | 1,000 requests/second |
| **Scalability** | Concurrent API requests | 100+ simultaneous connections |
| **Availability** | System Uptime | 99.5% |
| **Reliability** | Data Consistency | Strong (ACID transactions for vehicle updates) |
| **Reliability** | Duplicate Prevention Effectiveness | 100% for `external_id` + `company_code` + `branch_code` |
| **Reliability** | Idempotency Guarantee | 100% for `POST /api/vehicles` |
| **Security** | API Authentication | All endpoints except `/health` MUST require authentication (Auth.js) |
| **Security** | Data in Transit Encryption | TLS 1.3 for all API communication |
| **Security** | Input Validation | Strict schema validation on all API inputs |
| **Observability** | Logging Format | Structured JSON for all application and integration logs |
| **Observability** | Health Check Frequency | Every 30 seconds by monitoring systems |
| **Maintainability** | Code Coverage | > 80% for critical business logic |
| **Data Management** | Log Retention (Hot) | 90 days |
| **Data Management** | Dashboard Cache Freshness | Max 5 minutes |

## Technical Constraints

*   **Database:** The system MUST use a single PostgreSQL 15+ database instance. No sharding is permitted in the MVP.
*   **Backend Runtime:** The backend application MUST be developed using Node.js (LTS version).
*   **ORM:** Prisma MUST be used for database interactions.
*   **Authentication:** Auth.js (NextAuth) MUST be used for API authentication.
*   **Deployment Environment:** The application MUST be containerized using Docker.
*   **Local/Staging Orchestration:** Docker Compose MUST be used for local development and staging environments, including:
    *   An application container.
    *   A database container.
    *   A health check container (if separate from app).
    *   Persistent database volumes.
    *   `Dockerfile`, `docker-compose.yml`, and `.env.example` files MUST be provided.
*   **API Design:** All external integrations MUST be via synchronous RESTful API calls. Asynchronous job queues are not permitted in the MVP.
*   **Feedback Matching:** Vehicle duplicate resolution (if `chassis_number` conflicts) MUST be handled via manual feedback mechanisms, not automated ML-based solutions.
*   **Pricing Model:** The system MUST adhere to a flat-rate pricing model, without usage-based billing in the MVP.
*   **Real-time Updates:** No WebSocket-based real-time updates are permitted for the dashboard or other UI components in the MVP; polling is acceptable.

## Assumptions

*   **Timezone Handling:** Branch systems will consistently send `updated_at` timestamps in valid ISO 8601 format, including timezone offset (e.g., `+07:00`). The system will store all timestamps in UTC and convert for display as needed.
*   **Identifier Uniqueness:**
    *   `external_id` is assumed to be globally unique within a given `company_code` (enforced by branch systems).
    *   `chassis_number` is assumed to be globally unique across all vehicles in the real world (industry standard).
*   **Configuration:** `company_code` and `branch_code` values are pre-configured in the system; there is no self-service registration for these entities in the MVP.
*   **Vehicle Status Transitions:** While status changes are tracked, the system does not enforce a strict state machine for vehicle status transitions (e.g., `BOOKED` cannot directly go to `READY_STOCK`) in the MVP. This is assumed to be handled by the originating branch systems or will be added in a future version.
*   **Dashboard Data:** Dashboard queries are read-only and do not trigger any data modifications.
*   **Network Latency:** The network latency between external branch systems and the central API is assumed to be consistently low, typically less than 5 seconds.
*   **Deployment Environment:** The target deployment environment supports Docker and Docker Compose.
*   **Authentication:** All external systems integrating with `POST /api/vehicles` will be capable of authenticating using the provided Auth.js mechanism.