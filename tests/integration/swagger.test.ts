import request from "supertest";
import app from "../../src/app";

describe("Swagger / OpenAPI", () => {
  describe("GET /api-docs", () => {
    it("should serve Swagger UI HTML page", async () => {
      const res = await request(app).get("/api-docs/");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/html/);
      expect(res.text).toContain("swagger-ui");
    });

    it("should redirect /api-docs to /api-docs/", async () => {
      const res = await request(app).get("/api-docs");

      expect([301, 302]).toContain(res.status);
      expect(res.headers.location).toContain("/api-docs/");
    });

    it("should serve Swagger UI assets", async () => {
      const res = await request(app).get("/api-docs/swagger-ui.css");

      expect([200, 301, 302]).toContain(res.status);
    });

    it("should be publicly accessible (no auth required)", async () => {
      const res = await request(app).get("/api-docs/");

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api-docs.json", () => {
    it("should return valid OpenAPI 3.0 JSON spec", async () => {
      const res = await request(app).get("/api-docs.json");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toHaveProperty("openapi");
      expect(res.body.openapi).toMatch(/^3\./);
    });

    it("should include all API tags", async () => {
      const res = await request(app).get("/api-docs.json");

      const tagNames = res.body.tags.map((t: any) => t.name);
      expect(tagNames).toContain("Vehicles");
      expect(tagNames).toContain("Dashboard");
      expect(tagNames).toContain("Integration Logs");
      expect(tagNames).toContain("Health");
    });

    it("should document all 6 endpoints", async () => {
      const res = await request(app).get("/api-docs.json");

      const paths = Object.keys(res.body.paths);
      expect(paths).toContain("/api/vehicles");
      expect(paths).toContain("/api/vehicles/{external_id}");
      expect(paths).toContain("/api/dashboard/summary");
      expect(paths).toContain("/api/integration-logs");
      expect(paths).toContain("/health");
    });

    it("should include POST and GET methods for /api/vehicles", async () => {
      const res = await request(app).get("/api-docs.json");

      const methods = Object.keys(res.body.paths["/api/vehicles"]);
      expect(methods).toContain("post");
      expect(methods).toContain("get");
    });

    it("should define security scheme", async () => {
      const res = await request(app).get("/api-docs.json");

      expect(res.body.components.securitySchemes).toHaveProperty("bearerAuth");
      expect(res.body.components.securitySchemes.bearerAuth.type).toBe("http");
    });

    it("should define all reusable schemas", async () => {
      const res = await request(app).get("/api-docs.json");

      const schemas = Object.keys(res.body.components.schemas);
      expect(schemas).toContain("VehicleInput");
      expect(schemas).toContain("VehicleDetail");
      expect(schemas).toContain("DashboardSummary");
      expect(schemas).toContain("IntegrationLogEntry");
      expect(schemas).toContain("HealthResponse");
      expect(schemas).toContain("Pagination");
      expect(schemas).toContain("Error");
    });

    it("should be publicly accessible", async () => {
      const res = await request(app).get("/api-docs.json");

      expect(res.status).toBe(200);
    });

    it("should list all 6 vehicle statuses in schema", async () => {
      const res = await request(app).get("/api-docs.json");

      const statusEnum = res.body.components.schemas.VehicleInput.properties.status.enum;
      expect(statusEnum).toContain("IN_TRANSIT");
      expect(statusEnum).toContain("RECEIVED");
      expect(statusEnum).toContain("READY_STOCK");
      expect(statusEnum).toContain("BOOKED");
      expect(statusEnum).toContain("DELIVERED");
      expect(statusEnum).toContain("CANCELLED");
    });
  });
});
