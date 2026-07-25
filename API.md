# API.md: Untitled Project

## Authentication & Authorization

Authentication for all protected API endpoints is performed using JSON Web Tokens (JWTs) or API Keys, issued by the Auth.js (NextAuth) system.

*   **Method:** Bearer Token (JWT) or API Key.
*   **Header Format:** `Authorization: Bearer <token>`
*   **Auth Levels:**
    *   **Public:** No authentication required.
    *   **External System (Branch):** Authenticated via API Key or JWT, typically with specific permissions for data submission.
    *   **Operations User:** Authenticated via JWT, with read-only access to vehicle data and dashboard.
    *   **Admin/Integrator:** Authenticated via JWT, with full read/write access and access to integration logs.

## Standard Response & Pagination Formats

### Success Response

All successful API calls will return a JSON object with the following structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Endpoint-specific data
  }
}
```

### Error Response

All failed API calls will return a JSON object with the following structure:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    // Optional: Field-specific validation errors
    "field_name": [
      "Error message 1",
      "Error message 2"
    ]
  }
}
```

### Pagination Format

Endpoints supporting pagination will include a `pagination` object in the response:

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    // Array of resource objects
  ],
  "pagination": {
    "total_count": 100,
    "current_page": 1,
    "total_pages": 5,
    "limit": 20
  }
}
```

## API Endpoints

### Vehicle Stock Integration

#### POST /api/vehicles

*   **Description:** Receives vehicle data from external systems. Performs validation, prevents duplicates, and updates existing records. Records status changes to history. This endpoint is idempotent.
*   **Auth Level:** External System (Branch) / Admin/Integrator
*   **Request Body (JSON):**

    ```json
    {
      "external_id": "ADMS-000123",
      "company_code": "PT-AKA",
      "branch_code": "JKT01",
      "brand": "Hyundai",
      "model": "Creta",
      "year": 2026,
      "color": "Black",
      "chassis_number": "KMHXX123456789012",
      "engine_number": "G4FXX123456",
      "status": "READY_STOCK",
      "updated_at": "2026-07-20T10:30:00+07:00"
    }
    ```
    **Validation Rules:**
    *   `external_id`: Required.
    *   `chassis_number`: Required.
    *   `company_code`: Required.
    *   `branch_code`: Required.
    *   `status`: Required. Must be one of: `IN_TRANSIT`, `RECEIVED`, `READY_STOCK`, `BOOKED`, `DELIVERED`, `CANCELLED`.
    *   `updated_at`: Required. Must be a valid ISO 8601 timestamp (e.g., `YYYY-MM-DDTHH:mm:ss[+-]HH:mm`).
    *   If a vehicle with the same `external_id`, `company_code`, and `branch_code` already exists, the record will be updated.
    *   If `chassis_number` conflicts with an existing vehicle that has a *different* `external_id`, a `409 Conflict` will be returned.
    *   If the `status` changes, the previous status and change timestamp will be recorded in the vehicle's status history.
*   **Response Body (JSON):**
    *   **Success (200 OK):**
        ```json
        {
          "success": true,
          "message": "Vehicle data processed successfully",
          "data": {
            "external_id": "ADMS-000123",
            "status": "READY_STOCK"
          }
        }
        ```
    *   **Failure (400 Bad Request):**
        ```json
        {
          "success": false,
          "message": "Validation failed",
          "errors": {
            "chassis_number": [
              "Chassis number is required"
            ],
            "status": [
              "Invalid status value"
            ]
          }
        }
        ```
*   **Status Codes:**
    *   `200 OK`: Vehicle data processed (created or updated) successfully.
    *   `400 Bad Request`: Validation failed for request payload.
    *   `401 Unauthorized`: Authentication token is missing or invalid.
    *   `403 Forbidden`: Authenticated user/system does not have permission.
    *   `409 Conflict`: Chassis number conflict with another `external_id`.
    *   `500 Internal Server Error`: An unexpected server error occurred.

#### GET /api/vehicles

*   **Description:** Retrieves a paginated list of vehicles, with support for filtering, searching, and sorting.
*   **Auth Level:** Operations User / Admin/Integrator
*   **Query Parameters:**
    *   `page`: (Optional) Page number, default `1`.
    *   `limit`: (Optional) Number of items per page, default `20`, max `100`.
    *   `company_code`: (Optional) Filter by company code.
    *   `branch_code`: (Optional) Filter by branch code.
    *   `brand`: (Optional) Filter by vehicle brand.
    *   `model`: (Optional) Filter by vehicle model.
    *   `status`: (Optional) Filter by vehicle status (e.g., `status=READY_STOCK,BOOKED`). Supports multiple comma-separated values.
    *   `chassis_number`: (Optional) Search by chassis number (exact or partial match).
    *   `order_by`: (Optional) Field to sort by. Allowed values: `created_at`, `updated_at`, `brand`, `model`. Default `updated_at`.
    *   `sort`: (Optional) Sort order. Allowed values: `asc`, `desc`. Default `desc`.
*   **Response Body (JSON):**

    ```json
    {
      "success": true,
      "message": "Vehicles retrieved successfully",
      "data": [
        {
          "id": "uuid-of-vehicle",
          "external_id": "ADMS-000123",
          "company_code": "PT-AKA",
          "branch_code": "JKT01",
          "brand": "Hyundai",
          "model": "Creta",
          "year": 2026,
          "color": "Black",
          "status": "READY_STOCK",
          "updated_at": "2026-07-20T10:30:00+07:00"
        },
        // ... more vehicle objects
      ],
      "pagination": {
        "total_count": 100,
        "current_page": 1,
        "total_pages": 5,
        "limit": 20
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: List of vehicles retrieved successfully.
    *   `400 Bad Request`: Invalid query parameters.
    *   `401 Unauthorized`: Authentication token is missing or invalid.
    *   `403 Forbidden`: Authenticated user/system does not have permission.
    *   `500 Internal Server Error`: An unexpected server error occurred.

#### GET /api/vehicles/{external_id}

*   **Description:** Retrieves the detailed information for a single vehicle, including its status history. The `external_id` in the path refers to the unique identifier provided by the external system.
*   **Auth Level:** Operations User / Admin/Integrator
*   **Path Parameters:**
    *   `external_id`: The `external_id` of the vehicle to retrieve.
*   **Response Body (JSON):**

    ```json
    {
      "success": true,
      "message": "Vehicle detail retrieved successfully",
      "data": {
        "id": "uuid-of-vehicle",
        "external_id": "ADMS-000123",
        "company_code": "PT-AKA",
        "branch_code": "JKT01",
        "brand": "Hyundai",
        "model": "Creta",
        "year": 2026,
        "color": "Black",
        "chassis_number": "KMHXX123456789012",
        "engine_number": "G4FXX123456",
        "current_status": "READY_STOCK",
        "status_updated_at": "2026-07-20T10:30:00+07:00",
        "created_at": "2026-07-15T09:00:00+07:00",
        "updated_at": "2026-07-20T10:30:00+07:00",
        "status_history": [
          {
            "status": "IN_TRANSIT",
            "changed_at": "2026-07-15T09:00:00+07:00",
            "previous_status": null,
            "changed_by": "system"
          },
          {
            "status": "RECEIVED",
            "changed_at": "2026-07-18T14:15:00+07:00",
            "previous_status": "IN_TRANSIT",
            "changed_by": "system"
          },
          {
            "status": "READY_STOCK",
            "changed_at": "2026-07-20T10:30:00+07:00",
            "previous_status": "RECEIVED",
            "changed_by": "system"
          }
        ]
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Vehicle detail retrieved successfully.
    *   `401 Unauthorized`: Authentication token is missing or invalid.
    *   `403 Forbidden`: Authenticated user/system does not have permission.
    *   `404 Not Found`: Vehicle with the specified `external_id` not found.
    *   `500 Internal Server Error`: An unexpected server error occurred.

### Monitoring

#### GET /api/dashboard/summary

*   **Description:** Provides aggregated summary statistics for the vehicle stock, suitable for a monitoring dashboard. Results are cached for 5 minutes.
*   **Auth Level:** Operations User / Admin/Integrator
*   **Response Body (JSON):**

    ```json
    {
      "success": true,
      "message": "Dashboard summary retrieved successfully",
      "data": {
        "total_vehicles": 120,
        "updated_today": 15,
        "ready_stock_count": 55,
        "delivered_count": 25,
        "by_status": {
          "IN_TRANSIT": 10,
          "RECEIVED": 10,
          "READY_STOCK": 55,
          "BOOKED": 15,
          "DELIVERED": 25,
          "CANCELLED": 5
        },
        "by_company": {
          "PT-AKA": 65,
          "PT-AJN": 55
        },
        "by_branch": {
          "JKT01": 30,
          "BDG02": 20,
          "SBY03": 40,
          "DPS04": 30
        },
        "top_5_models": [
          { "model": "Creta", "count": 25 },
          { "model": "Xpander", "count": 20 },
          { "model": "Innova", "count": 18 },
          { "model": "HR-V", "count": 15 },
          { "model": "Fortuner", "count": 12 }
        ],
        "cache_timestamp": "2026-07-20T10:35:00+07:00"
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Dashboard summary retrieved successfully.
    *   `401 Unauthorized`: Authentication token is missing or invalid.
    *   `403 Forbidden`: Authenticated user/system does not have permission.
    *   `500 Internal Server Error`: An unexpected server error occurred.

### Integration Logs

#### GET /api/integration-logs

*   **Description:** Retrieves a paginated list of integration logs, detailing the success or failure of vehicle data submissions.
*   **Auth Level:** Admin/Integrator
*   **Query Parameters:**
    *   `page`: (Optional) Page number, default `1`.
    *   `limit`: (Optional) Number of items per page, default `50`, max `500`.
    *   `status`: (Optional) Filter by integration status. Allowed values: `success`, `failure`.
    *   `external_id`: (Optional) Filter by the `external_id` of the vehicle involved.
    *   `date_from`: (Optional) Filter logs from this date (ISO 8601, e.g., `2026-07-01`).
    *   `date_to`: (Optional) Filter logs up to this date (ISO 8601, e.g., `2026-07-31`).
    *   `company_code`: (Optional) Filter by the company code associated with the request.
*   **Response Body (JSON):**

    ```json
    {
      "success": true,
      "message": "Integration logs retrieved successfully",
      "data": [
        {
          "correlation_id": "req-abc-123",
          "request_timestamp": "2026-07-20T10:30:00+07:00",
          "endpoint": "/api/vehicles",
          "http_method": "POST",
          "external_id": "ADMS-000123",
          "company_code": "PT-AKA",
          "success": true,
          "http_status_code": 200,
          "error_message": null,
          "processing_time_ms": 125,
          "request_payload_summary": {
            "external_id": "ADMS-000123",
            "company_code": "PT-AKA",
            "branch_code": "JKT01",
            "brand": "Hyundai",
            "model": "Creta",
            "status": "READY_STOCK"
          }
        },
        {
          "correlation_id": "req-def-456",
          "request_timestamp": "2026-07-20T10:31:00+07:00",
          "endpoint": "/api/vehicles",
          "http_method": "POST",
          "external_id": "ADMS-000124",
          "company_code": "PT-AKA",
          "success": false,
          "http_status_code": 400,
          "error_message": "Validation failed: Chassis number is required",
          "processing_time_ms": 80,
          "request_payload_summary": {
            "external_id": "ADMS-000124",
            "company_code": "PT-AKA",
            "branch_code": "JKT01",
            "brand": "Toyota",
            "model": "Innova",
            "status": "RECEIVED"
            // chassis_number missing
          }
        }
      ],
      "pagination": {
        "total_count": 500,
        "current_page": 1,
        "total_pages": 10,
        "limit": 50
      }
    }
    ```
    *Note: `request_payload_summary` will exclude sensitive data like `chassis_number` and `engine_number`.*
*   **Status Codes:**
    *   `200 OK`: Integration logs retrieved successfully.
    *   `400 Bad Request`: Invalid query parameters.
    *   `401 Unauthorized`: Authentication token is missing or invalid.
    *   `403 Forbidden`: Authenticated user/system does not have permission.
    *   `500 Internal Server Error`: An unexpected server error occurred.

### Health Check

#### GET /health

*   **Description:** Provides a simple health check endpoint to monitor the application's status and its dependencies.
*   **Auth Level:** Public
*   **Response Body (JSON):**

    ```json
    {
      "status": "healthy",
      "database": "connected",
      "version": "1.0.0",
      "server_time": "2026-07-20T10:30:00+07:00",
      "response_time_ms": 15
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Application and all critical dependencies are healthy.
    *   `503 Service Unavailable`: Application or a critical dependency is unhealthy or degraded.