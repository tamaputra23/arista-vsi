import request from "supertest";
import app from "../../src/app";
import { signJwt } from "../../src/lib/jwt";
import { authHeaders, jwtOnlyHeader, apiKeyOnlyHeader, TEST_JWT_SECRET, TEST_API_KEYS } from "../helpers/auth";

describe("Phase 4 Dual Auth — JWT + API-Key", () => {
  // ═══════════════════════════════════════════════
  // Success: both JWT and API-key are valid
  // ═══════════════════════════════════════════════

  it("should accept valid admin JWT + admin API key on admin endpoint", async () => {
    const res = await request(app)
      .get("/api/integration-logs")
      .set(authHeaders("admin"));

    // 200 or 500 (no DB) — but NOT 401 or 403
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it("should accept valid ops JWT + ops API key on dashboard", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set(authHeaders("ops"));

    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it("should accept valid branch JWT + branch API key on POST /api/vehicles", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set(authHeaders("branch"))
      .send({
        external_id: "JWT-DUAL-001",
        company_code: "PT-AKA",
        branch_code: "JKT01",
        brand: "Toyota",
        model: "Avanza",
        year: 2025,
        color: "Silver",
        chassis_number: "JWTDUALCHS001",
        engine_number: "JWTDUALENG001",
        status: "READY_STOCK",
        updated_at: new Date().toISOString(),
      });

    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  // ═══════════════════════════════════════════════
  // Role-based authorization (JWT role is source of truth)
  // ═══════════════════════════════════════════════

  it("should return 403 when branch JWT tries ops-only endpoint", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set(authHeaders("branch"));

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should return 403 when ops JWT tries admin-only endpoint", async () => {
    const res = await request(app)
      .get("/api/integration-logs")
      .set(authHeaders("ops"));

    expect(res.status).toBe(403);
  });

  // ═══════════════════════════════════════════════
  // Missing headers
  // ═══════════════════════════════════════════════

  it("should return 401 when no Authorization header", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set({ "X-API-Key": TEST_API_KEYS.ops });

    expect(res.status).toBe(401);
  });

  it("should return 401 when no X-API-Key header", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set(jwtOnlyHeader("ops"));

    expect(res.status).toBe(401);
  });

  it("should return 401 when neither header is present", async () => {
    const res = await request(app).get("/api/dashboard/summary");
    expect(res.status).toBe(401);
  });

  // ═══════════════════════════════════════════════
  // Invalid credentials
  // ═══════════════════════════════════════════════

  it("should return 401 for valid JWT + invalid API key", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set({ ...jwtOnlyHeader("admin"), "X-API-Key": "not-a-valid-key" });

    expect(res.status).toBe(401);
  });

  it("should return 401 for invalid JWT + valid API key", async () => {
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set({
        Authorization: "Bearer not.a.valid.jwt",
        "X-API-Key": TEST_API_KEYS.admin,
      });

    expect(res.status).toBe(401);
  });

  it("should return 401 for JWT signed with wrong secret", async () => {
    const wrongJwt = signJwt({ role: "admin" }, "wrong-secret-with-at-least-thirty-two-chars!!");
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set({
        Authorization: `Bearer ${wrongJwt}`,
        "X-API-Key": TEST_API_KEYS.admin,
      });

    expect(res.status).toBe(401);
  });

  it("should return 401 for tampered JWT payload", async () => {
    const validJwt = signJwt({ role: "admin" }, TEST_JWT_SECRET);
    const parts = validJwt.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ sub: "vehicle-stock-platform", role: "admin", iat: 1, exp: 9999999999 }),
    ).toString("base64url");
    const tamperedJwt = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const res = await request(app)
      .get("/api/dashboard/summary")
      .set({
        Authorization: `Bearer ${tamperedJwt}`,
        "X-API-Key": TEST_API_KEYS.admin,
      });

    expect(res.status).toBe(401);
  });

  it("should return 401 for JWT with alg:none", async () => {
    const noneHeader = Buffer.from(
      JSON.stringify({ alg: "none", typ: "JWT" }),
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({ sub: "vehicle-stock-platform", role: "admin", iat: 1, exp: 9999999999 }),
    ).toString("base64url");
    const noneJwt = `${noneHeader}.${payload}.`;

    const res = await request(app)
      .get("/api/dashboard/summary")
      .set({
        Authorization: `Bearer ${noneJwt}`,
        "X-API-Key": TEST_API_KEYS.admin,
      });

    expect(res.status).toBe(401);
  });

  // ═══════════════════════════════════════════════
  // Health endpoint — public, no auth
  // ═══════════════════════════════════════════════

  it("should allow unauthenticated access to /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });
});
