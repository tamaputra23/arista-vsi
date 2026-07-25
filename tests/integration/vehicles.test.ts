import request from "supertest";
import app from "../../src/app";
import { cleanDatabase, seedTestData, disconnect } from "../helpers/db";
import { authHeaders, jwtOnlyHeader, apiKeyOnlyHeader } from "../helpers/auth";

// Admin role for tests (can access all endpoints)
const AUTH = authHeaders("admin");

const validVehicle = {
  external_id: "TEST-001",
  company_code: "PT-AKA",
  branch_code: "JKT01",
  brand: "Hyundai",
  model: "Creta",
  year: 2026,
  color: "Black",
  chassis_number: "KMHXX12345678901",
  engine_number: "G4FXX123456",
  status: "READY_STOCK",
  updated_at: "2026-07-20T10:30:00+07:00",
};

beforeAll(async () => {
  await seedTestData();
});

afterEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await disconnect();
});

describe("POST /api/vehicles", () => {
  it("should create a new vehicle and return 200", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send(validVehicle);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.external_id).toBe("TEST-001");
    expect(res.body.data.status).toBe("READY_STOCK");
  });

  it("should be idempotent — same payload returns 200 on retry", async () => {
    // First request
    await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send(validVehicle);

    // Second identical request
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send(validVehicle);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.external_id).toBe("TEST-001");
  });

  it("should update vehicle when external_id + company + branch match", async () => {
    // Create
    await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send(validVehicle);

    // Update with new status
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({ ...validVehicle, status: "BOOKED" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("BOOKED");
  });

  it("should return 409 when chassis_number conflicts with different external_id", async () => {
    // Create first vehicle
    await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send(validVehicle);

    // Try to create second vehicle with same chassis but different external_id
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({ ...validVehicle, external_id: "TEST-002" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for missing required fields", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({ external_id: "NO-FIELDS" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it("should return 400 for invalid status", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({ ...validVehicle, status: "INVALID_STATUS" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 when no auth header provided", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .send(validVehicle);

    expect(res.status).toBe(401);
  });

  it("should return 401 for missing X-API-Key header", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(jwtOnlyHeader("branch"))
      .send(validVehicle);

    expect(res.status).toBe(401);
  });

  it("should return 401 for invalid API key (valid JWT, wrong API key)", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set({ ...jwtOnlyHeader("branch"), "X-API-Key": "wrong-key" })
      .send(validVehicle);

    expect(res.status).toBe(401);
  });

  it("should return 401 for invalid JWT (valid API key, bad JWT)", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set({ Authorization: "Bearer not.a.validjwt", "X-API-Key": "test-branch-api-key" })
      .send(validVehicle);

    expect(res.status).toBe(401);
  });

  it("should return 403 for branch role accessing admin-only endpoint", async () => {
    // Import fresh to get branch auth
    const { authHeaders: ah } = await import("../helpers/auth");
    const res = await request(app)
      .get("/api/integration-logs")
      .set(ah("branch"));

    expect(res.status).toBe(403);
  });
});

describe("GET /api/vehicles", () => {
  it("should return paginated vehicle list", async () => {
    // Seed a vehicle first
    await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send(validVehicle);

    const res = await request(app)
      .get("/api/vehicles")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total_count).toBe(1);
  });

  it("should filter by company_code", async () => {
    await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send(validVehicle);

    const res = await request(app)
      .get("/api/vehicles?company_code=PT-AKA")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it("should return empty array when no matches", async () => {
    const res = await request(app)
      .get("/api/vehicles?company_code=NONEXISTENT")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total_count).toBe(0);
  });

  it("should filter by brand", async () => {
    await request(app).post("/api/vehicles").set(AUTH).send(validVehicle); // Hyundai
    await request(app).post("/api/vehicles").set(AUTH).send({
      ...validVehicle, external_id: "TEST-002", chassis_number: "TWYXX12345678909",
      engine_number: "ENGXX888888", brand: "Toyota", model: "Innova",
    });

    const res = await request(app)
      .get("/api/vehicles?brand=Toyota")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].brand).toBe("Toyota");
  });

  it("should filter by model", async () => {
    await request(app).post("/api/vehicles").set(AUTH).send(validVehicle); // Creta
    await request(app).post("/api/vehicles").set(AUTH).send({
      ...validVehicle, external_id: "TEST-003", chassis_number: "HWNXX12345678901",
      engine_number: "ENGXX777777", model: "HR-V",
    });

    const res = await request(app)
      .get("/api/vehicles?model=HR-V")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].model).toBe("HR-V");
  });

  it("should filter by year range", async () => {
    await request(app).post("/api/vehicles").set(AUTH).send(validVehicle); // year 2026

    const res = await request(app)
      .get("/api/vehicles?year_from=2025&year_to=2027")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);

    const outside = await request(app)
      .get("/api/vehicles?year_from=2010&year_to=2015")
      .set(AUTH);

    expect(outside.body.pagination.total_count).toBe(0);
  });

  it("should search by chassis_number (partial match)", async () => {
    await request(app).post("/api/vehicles").set(AUTH).send(validVehicle);

    const res = await request(app)
      .get("/api/vehicles?chassis_number=KMHXX")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it("should filter by multiple statuses", async () => {
    await request(app).post("/api/vehicles").set(AUTH)
      .send({ ...validVehicle, chassis_number: "MUL1XX12345678901", engine_number: "ENG1", status: "READY_STOCK" });
    await request(app).post("/api/vehicles").set(AUTH)
      .send({ ...validVehicle, external_id: "TEST-004", chassis_number: "MUL2XX12345678901", engine_number: "ENG2", status: "BOOKED" });
    await request(app).post("/api/vehicles").set(AUTH)
      .send({ ...validVehicle, external_id: "TEST-005", chassis_number: "MUL3XX12345678901", engine_number: "ENG3", status: "DELIVERED" });

    const res = await request(app)
      .get("/api/vehicles?status=READY_STOCK,BOOKED")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data.map((v: any) => v.status).sort()).toEqual(["BOOKED", "READY_STOCK"]);
  });

  it("should sort by brand ascending", async () => {
    await request(app).post("/api/vehicles").set(AUTH)
      .send({ ...validVehicle, chassis_number: "SRT1XX12345678901", engine_number: "ES1", brand: "Hyundai" });
    await request(app).post("/api/vehicles").set(AUTH)
      .send({ ...validVehicle, external_id: "TEST-006", chassis_number: "SRT2XX12345678901", engine_number: "ES2", brand: "Toyota" });

    const res = await request(app)
      .get("/api/vehicles?order_by=brand&sort=asc")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data[0].brand.localeCompare(res.body.data[1].brand)).toBeLessThanOrEqual(0);
  });

  it("should sort by updated_at descending by default", async () => {
    await request(app).post("/api/vehicles").set(AUTH)
      .send({ ...validVehicle, chassis_number: "DFT1XX12345678901", engine_number: "ED1" });
    // Wait for timestamp separation
    await new Promise(r => setTimeout(r, 1000));
    await request(app).post("/api/vehicles").set(AUTH)
      .send({ ...validVehicle, external_id: "TEST-007", chassis_number: "DFT2XX12345678901", engine_number: "ED2", status: "BOOKED" });

    const res = await request(app)
      .get("/api/vehicles")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    // Default sort is updated_at desc — first result should be newer or equal
    const timestamps = res.body.data.map((v: any) => new Date(v.updated_at).getTime());
    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
    }
  });

  it("should respect pagination limit", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post("/api/vehicles").set(AUTH).send({
        ...validVehicle, external_id: `PAGE-00${i}`,
        chassis_number: `PAGXX${i}12345678901`, engine_number: `EPG${i}`,
      });
    }

    const res = await request(app)
      .get("/api/vehicles?limit=3&page=1")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(3);
    expect(res.body.pagination.total_pages).toBeGreaterThanOrEqual(2);
    expect(res.body.pagination.limit).toBe(3);
  });
});

describe("GET /api/vehicles/:external_id", () => {
  it("should return vehicle detail with status history", async () => {
    await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send(validVehicle);

    const res = await request(app)
      .get("/api/vehicles/TEST-001")
      .set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data.external_id).toBe("TEST-001");
    expect(res.body.data.chassis_number).toBe("KMHXX12345678901");
    expect(res.body.data.engine_number).toBe("G4FXX123456");
    expect(res.body.data.status_history).toBeDefined();
    expect(res.body.data.status_history.length).toBeGreaterThan(0);
  });

  it("should return 404 for non-existent vehicle", async () => {
    const res = await request(app)
      .get("/api/vehicles/NONEXISTENT")
      .set(AUTH);

    expect(res.status).toBe(404);
  });
});
