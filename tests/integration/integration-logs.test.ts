import request from "supertest";
import app from "../../src/app";
import { cleanDatabase, seedTestData, disconnect } from "../helpers/db";
import { authHeaders } from "../helpers/auth";

const AUTH = authHeaders("admin");

beforeAll(async () => {
  await seedTestData();
});

afterEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await disconnect();
});

describe("GET /api/integration-logs", () => {
  it("should return paginated integration logs (admin access)", async () => {
    // First, make a POST request to generate a log entry
    await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({
        external_id: "LOG-001",
        company_code: "PT-AKA",
        branch_code: "JKT01",
        brand: "Honda",
        model: "HR-V",
        year: 2026,
        color: "Red",
        chassis_number: "HWNXX12345678901",
        engine_number: "ENGXX111111",
        status: "IN_TRANSIT",
        updated_at: new Date().toISOString(),
      });

    const res = await request(app)
      .get("/api/integration-logs")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should filter logs by status", async () => {
    const res = await request(app)
      .get("/api/integration-logs?status=success")
      .set(AUTH);

    expect(res.status).toBe(200);
    // All returned logs should have success=true
    for (const log of res.body.data) {
      expect(log.success).toBe(true);
    }
  });

  it("should filter logs by external_id", async () => {
    // Ingest a specific vehicle
    await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({
        external_id: "FILTER-TEST",
        company_code: "PT-AKA",
        branch_code: "JKT01",
        brand: "Suzuki",
        model: "Ertiga",
        year: 2026,
        color: "Silver",
        chassis_number: "SUZXX12345678901",
        engine_number: "ENGXX222222",
        status: "RECEIVED",
        updated_at: new Date().toISOString(),
      });

    const res = await request(app)
      .get("/api/integration-logs?external_id=FILTER-TEST")
      .set(AUTH);

    expect(res.status).toBe(200);
    for (const log of res.body.data) {
      expect(log.external_id).toBe("FILTER-TEST");
    }
  });

  it("should not expose sensitive data in request_payload_summary", async () => {
    // The integration logs are created by the POST route. Verify a log entry exists
    // and that it doesn't contain sensitive fields.
    await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({
        external_id: "SENSITIVE-001",
        company_code: "PT-AKA",
        branch_code: "JKT01",
        brand: "Mitsubishi",
        model: "Xpander",
        year: 2026,
        color: "Gray",
        chassis_number: "MTWXX12345678901",
        engine_number: "ENGXX333333",
        status: "IN_TRANSIT",
        updated_at: new Date().toISOString(),
      });

    const res = await request(app)
      .get("/api/integration-logs?external_id=SENSITIVE-001")
      .set(AUTH);

    expect(res.status).toBe(200);
    const log = res.body.data[0];
    if (log.request_payload_summary) {
      const summary = log.request_payload_summary;
      expect(summary).not.toHaveProperty("chassis_number");
      expect(summary).not.toHaveProperty("engine_number");
      expect(summary).not.toHaveProperty("chassisNumber");
      expect(summary).not.toHaveProperty("engineNumber");
    }
  });
});
