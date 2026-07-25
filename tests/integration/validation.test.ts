import request from "supertest";
import app from "../../src/app";
import { authHeaders } from "../helpers/auth";

const AUTH = authHeaders("branch");

const validVehicle = {
  external_id: "VAL-001",
  company_code: "PT-AKA",
  branch_code: "JKT01",
  brand: "Toyota",
  model: "Avanza",
  year: 2025,
  color: "Silver",
  chassis_number: "TWYXX1234567890",
  engine_number: "ENG-TEST-001",
  status: "READY_STOCK",
  updated_at: new Date().toISOString(),
};

describe("Input Validation — Stricter Formats", () => {
  // ═══════════════════════════════════════════════
  // Chassis number format (VIN-like: 11-17, no I/O/Q)
  // ═══════════════════════════════════════════════

  it("should reject chassis_number shorter than 11 chars", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({ ...validVehicle, chassis_number: "ABC123" });

    expect(res.status).toBe(400);
    expect(res.body.errors.chassis_number).toBeDefined();
  });

  it("should reject chassis_number longer than 17 chars", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({ ...validVehicle, chassis_number: "ABCDEFGH12345678901" });

    expect(res.status).toBe(400);
    expect(res.body.errors.chassis_number).toBeDefined();
  });

  it("should reject chassis_number with letter I", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({ ...validVehicle, chassis_number: "KMHIX1234567890" });

    expect(res.status).toBe(400);
    expect(res.body.errors.chassis_number).toBeDefined();
  });

  it("should reject chassis_number with letter O", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({ ...validVehicle, chassis_number: "KMHOX1234567890" });

    expect(res.status).toBe(400);
    expect(res.body.errors.chassis_number).toBeDefined();
  });

  // ═══════════════════════════════════════════════
  // External ID format
  // ═══════════════════════════════════════════════

  it("should reject external_id with special characters", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({ ...validVehicle, external_id: "TEST@#$", chassis_number: "KMHXX12345678901" });

    expect(res.status).toBe(400);
    expect(res.body.errors.external_id).toBeDefined();
  });

  // ═══════════════════════════════════════════════
  // Content-Type enforcement
  // ═══════════════════════════════════════════════

  it("should return 415 when Content-Type is not application/json", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set({ ...AUTH, "Content-Type": "text/plain" })
      .send("not json");

    expect(res.status).toBe(415);
    expect(res.body.success).toBe(false);
  });

  // ═══════════════════════════════════════════════
  // Sanitization (HTML stripping)
  // ═══════════════════════════════════════════════

  it("should reject brand with HTML tags (rejected at Zod regex level)", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({
        ...validVehicle,
        chassis_number: "KMHXX12345678901",
        brand: "<b>Toyota</b>",
        model: "Avanza",
      });

    // HTML angle brackets don't match the brand regex — rejected before sanitization
    expect(res.status).toBe(400);
    expect(res.body.errors.brand).toBeDefined();
  });

  // ═══════════════════════════════════════════════
  // Query string size limit
  // ═══════════════════════════════════════════════

  it("should reject excessively long query strings", async () => {
    const longParam = "x".repeat(3000);
    const res = await request(app)
      .get(`/api/vehicles?q=${longParam}`)
      .set(authHeaders("admin"));

    expect(res.status).toBe(413);
    expect(res.body.success).toBe(false);
  });
});

describe("Input Validation — Business Rules", () => {
  // ═══════════════════════════════════════════════
  // Company existence
  // ═══════════════════════════════════════════════

  it("should reject non-existent company_code", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      .send({ ...validVehicle, company_code: "NONEXISTENT", chassis_number: "KMHXX12345678901" });

    expect(res.status).toBe(400);
    expect(res.body.errors.company_code).toBeDefined();
  });

  // ═══════════════════════════════════════════════
  // Branch belongs to company
  // ═══════════════════════════════════════════════

  it("should reject branch_code that does not belong to company", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(AUTH)
      // SBY01 belongs to PT-AJN, not PT-AKA
      .send({
        ...validVehicle,
        company_code: "PT-AKA",
        branch_code: "SBY01",
        chassis_number: "KMHXX12345678901",
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.branch_code).toBeDefined();
  });
});
