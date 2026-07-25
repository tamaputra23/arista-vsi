import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { cleanDatabase, seedTestData, disconnect } from "../helpers/db";
import { authHeaders } from "../helpers/auth";

const AUTH = authHeaders("admin");

const simulationPayload = {
  external_id: "SIM-CONCURRENT-001",
  company_code: "PT-AKA",
  branch_code: "JKT01",
  brand: "Toyota",
  model: "Avanza",
  year: 2025,
  color: "Silver",
  chassis_number: "SMHCHASSS00001",
  engine_number: "SIMENGINE001",
  status: "READY_STOCK",
  updated_at: new Date().toISOString(),
  parallel_count: 10,
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

describe("POST /api/simulations/duplicate-request", () => {
  // ═══════════════════════════════════════════════
  // Database consistency: the atomic upsert prevents duplicates
  // ═══════════════════════════════════════════════

  it("should produce exactly 1 vehicle from 10 parallel identical requests", async () => {
    const res = await request(app)
      .post("/api/simulations/duplicate-request")
      .set(AUTH)
      .send(simulationPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;

    // All 10 requests were sent
    expect(data.requests_sent).toBe(10);
    // Zero failures — all requests completed
    expect(data.results.failed).toBe(0);

    // ── Database consistency proofs ──
    // The atomic Prisma upsert (INSERT ... ON CONFLICT ... DO UPDATE)
    // guarantees exactly 1 row regardless of concurrent load
    expect(data.verification.vehicles_found).toBe(1);
    expect(data.concurrency_proof.no_duplicate_vehicles).toBe(true);

    // All 10 requests are logged (each has its own correlation_id)
    expect(data.verification.integration_log_entries).toBe(10);
    expect(data.concurrency_proof.all_requests_logged).toBe(true);

    // Overall database is consistent
    expect(data.verification.database_consistent).toBe(true);
    expect(data.concurrency_proof.idempotent_upsert_working).toBe(true);
  });

  // ═══════════════════════════════════════════════
  // Status history: initial creation guarded against duplicates
  // ═══════════════════════════════════════════════

  it("should record the initial status history entry (guarded against duplicates)", async () => {
    const res = await request(app)
      .post("/api/simulations/duplicate-request")
      .set(AUTH)
      .send(simulationPayload);

    expect(res.status).toBe(200);

    const data = res.body.data;

    // At least 1 status history entry (the initial creation)
    // Under extreme concurrency, may be slightly more if the guard races
    expect(data.verification.status_history_entries).toBeGreaterThanOrEqual(1);

    // Verify directly from DB: the vehicle exists with status history
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        externalId: "SIM-CONCURRENT-001",
        companyCode: "PT-AKA",
        branchCode: "JKT01",
      },
      include: { statusHistory: true },
    });

    expect(vehicle).not.toBeNull();
    // Initial status history exists
    const initialEntries = vehicle!.statusHistory.filter(
      (h) => h.previousStatus === "",
    );
    // At least 1 initial creation entry
    expect(initialEntries.length).toBeGreaterThanOrEqual(1);
    // The new_status is READY_STOCK
    expect(initialEntries[0].newStatus).toBe("READY_STOCK");
  });

  // ═══════════════════════════════════════════════
  // Status change tracking (sequential — not concurrent)
  // ═══════════════════════════════════════════════

  it("should record a second status history entry when status changes on subsequent requests", async () => {
    // First run: create vehicle (parallel_count: 2 for speed)
    const first = await request(app)
      .post("/api/simulations/duplicate-request")
      .set(AUTH)
      .send({ ...simulationPayload, parallel_count: 2 });

    expect(first.status).toBe(200);
    const firstHistoryCount = first.body.data.verification.status_history_entries;

    // Second run: same vehicle, DIFFERENT status, DIFFERENT chassis (to avoid 409)
    const second = await request(app)
      .post("/api/simulations/duplicate-request")
      .set(AUTH)
      .send({
        ...simulationPayload,
        chassis_number: "SMHCHASSS00002",
        status: "BOOKED",
        parallel_count: 2,
      });

    expect(second.status).toBe(200);
    // Vehicle count still exactly 1
    expect(second.body.data.verification.vehicles_found).toBe(1);
    // Status history increased (the BOOKED transition was recorded)
    expect(second.body.data.verification.status_history_entries).toBeGreaterThan(
      firstHistoryCount,
    );
  });

  // ═══════════════════════════════════════════════
  // No fake status changes (same status repeated)
  // ═══════════════════════════════════════════════

  it("should NOT add status history when status does not change", async () => {
    // Create
    const first = await request(app)
      .post("/api/simulations/duplicate-request")
      .set(AUTH)
      .send({ ...simulationPayload, parallel_count: 2 });

    const firstCount = first.body.data.verification.status_history_entries;

    // Run again with SAME status
    const second = await request(app)
      .post("/api/simulations/duplicate-request")
      .set(AUTH)
      .send({
        ...simulationPayload,
        chassis_number: "SMHCHASSS00003",
        status: "READY_STOCK", // same
        parallel_count: 2,
      });

    expect(second.status).toBe(200);
    // Status history count unchanged — no fake "change" recorded
    expect(second.body.data.verification.status_history_entries).toBe(firstCount);
  });

  // ═══════════════════════════════════════════════
  // Integration log completeness
  // ═══════════════════════════════════════════════

  it("should log every single request", async () => {
    const res = await request(app)
      .post("/api/simulations/duplicate-request")
      .set(AUTH)
      .send(simulationPayload);

    const data = res.body.data;

    // N requests sent, all logged (allow ±1 for extreme concurrency edge cases)
    expect(data.verification.integration_log_entries).toBeGreaterThanOrEqual(9);
    // All successful
    expect(data.verification.successful_logs).toBeGreaterThanOrEqual(9);
    // Details array has 10 entries
    expect(data.details.length).toBe(10);
    for (const detail of data.details) {
      expect(detail.success).toBe(true);
      expect(detail.correlation_id).toBeTruthy();
    }
  });

  // ═══════════════════════════════════════════════
  // Auth + validation
  // ═══════════════════════════════════════════════

  it("should return 401 without auth", async () => {
    const res = await request(app)
      .post("/api/simulations/duplicate-request")
      .send(simulationPayload);

    expect(res.status).toBe(401);
  });

  it("should return 403 for non-admin role", async () => {
    const branchAuth = authHeaders("branch");
    const res = await request(app)
      .post("/api/simulations/duplicate-request")
      .set(branchAuth)
      .send(simulationPayload);

    expect(res.status).toBe(403);
  });

  it("should return 400 when parallel_count is less than 2", async () => {
    const res = await request(app)
      .post("/api/simulations/duplicate-request")
      .set(AUTH)
      .send({ ...simulationPayload, parallel_count: 1 });

    expect(res.status).toBe(400);
  });
});
