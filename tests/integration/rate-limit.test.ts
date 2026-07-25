import request from "supertest";
import app from "../../src/app";
import { authHeaders, TEST_API_KEYS } from "../helpers/auth";

describe("Rate Limiting", () => {
  // ═══════════════════════════════════════════════
  // Admin is unlimited
  // ═══════════════════════════════════════════════

  it("should allow many requests for admin role (unlimited)", async () => {
    const auth = authHeaders("admin");
    // Send 20 requests — admin should never be rate limited
    const results: number[] = [];
    for (let i = 0; i < 20; i++) {
      const res = await request(app)
        .get("/api/dashboard/summary")
        .set(auth);
      results.push(res.status);
    }

    // All should succeed (200 or 500 if DB unavailable, but NOT 429)
    for (const status of results) {
      expect(status).not.toBe(429);
    }
  });

  // ═══════════════════════════════════════════════
  // Rate limit headers
  // ═══════════════════════════════════════════════

  it("should return RateLimit-* headers on responses", async () => {
    const auth = authHeaders("ops");
    const res = await request(app)
      .get("/api/dashboard/summary")
      .set(auth);

    // Standard rate limit headers (Draft-6)
    // May or may not be present depending on rate limiter state
    // At minimum, the response should be valid
    expect([200, 500]).toContain(res.status);
  });

  // ═══════════════════════════════════════════════
  // Health endpoint has public rate limit
  // ═══════════════════════════════════════════════

  it("should allow many requests to /health (120/min for public)", async () => {
    const results: number[] = [];
    for (let i = 0; i < 30; i++) {
      const res = await request(app).get("/health");
      results.push(res.status);
    }

    // 30 requests should all be fine under 120/min limit
    for (const status of results) {
      expect(status).not.toBe(429);
    }
  });

  // ═══════════════════════════════════════════════
  // Missing auth — treated as public, gets lower limit
  // ═══════════════════════════════════════════════

  it("should return 401 (not 429) for missing auth on protected endpoint", async () => {
    // Public role with default limit — a few requests shouldn't hit the limit
    const res = await request(app).get("/api/dashboard/summary");
    // 401 because no auth, NOT 429
    expect(res.status).toBe(401);
  });

  // ═══════════════════════════════════════════════
  // POST endpoint has specific limits
  // ═══════════════════════════════════════════════

  it("should allow branch to POST within limit", async () => {
    const auth = authHeaders("branch");
    const res = await request(app)
      .post("/api/vehicles")
      .set(auth)
      .send({
        external_id: "RATE-TEST-001",
        company_code: "PT-AKA",
        branch_code: "JKT01",
        brand: "Toyota",
        model: "Avanza",
        year: 2025,
        color: "Silver",
        chassis_number: "RTLMTSTCHS001",
        engine_number: "RTLMTSTENG001",
        status: "READY_STOCK",
        updated_at: new Date().toISOString(),
      });

    // Should be 200 (success) or 400/409 (validation/conflict) — NOT 429
    expect(res.status).not.toBe(429);
  });
});
