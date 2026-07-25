import request from "supertest";
import app from "../../src/app";
import { cleanDatabase, seedTestData, disconnect } from "../helpers/db";
import { dashboardCache } from "../../src/lib/cache";
import { authHeaders } from "../helpers/auth";

const AUTH = authHeaders("admin");

beforeAll(async () => {
  await seedTestData();
});

afterEach(async () => {
  await cleanDatabase();
  dashboardCache.invalidate();
});

afterAll(async () => {
  await disconnect();
});

describe("GET /api/dashboard/summary", () => {
  it("should return dashboard summary with all expected metrics", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data).toHaveProperty("total_vehicles");
    expect(data).toHaveProperty("updated_today");
    expect(data).toHaveProperty("ready_stock_count");
    expect(data).toHaveProperty("delivered_count");
    expect(data).toHaveProperty("by_status");
    expect(data).toHaveProperty("by_company");
    expect(data).toHaveProperty("by_branch");
    expect(data).toHaveProperty("top_5_models");
    expect(data).toHaveProperty("cache_timestamp");

    // All statuses should be present even if zero
    expect(data.by_status).toHaveProperty("IN_TRANSIT");
    expect(data.by_status).toHaveProperty("READY_STOCK");
    expect(data.by_status).toHaveProperty("DELIVERED");
  });

  it("should return 401 without authentication", async () => {
    const res = await request(app).get("/api/dashboard/summary");

    expect(res.status).toBe(401);
  });

  it("should reflect vehicle data after ingestion", async () => {
    // Ingest a vehicle
    await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({
        external_id: "DSH-001",
        company_code: "PT-AKA",
        branch_code: "JKT01",
        brand: "Toyota",
        model: "Innova",
        year: 2026,
        color: "White",
        chassis_number: "TWYXX12345678909",
        engine_number: "ENGXX999999",
        status: "READY_STOCK",
        updated_at: new Date().toISOString(),
      });

    // Invalidate cache to get fresh data (cache is invalidated on POST)
    dashboardCache.invalidate();

    const res = await request(app)
      .get("/api/dashboard/summary")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data.total_vehicles).toBe(1);
    expect(res.body.data.by_status.READY_STOCK).toBe(1);
  });
});
