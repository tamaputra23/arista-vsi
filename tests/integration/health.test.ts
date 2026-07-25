import request from "supertest";
import app from "../../src/app";

describe("GET /health", () => {
  it("should return 200 with healthy status when database is connected", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("database");
    expect(res.body).toHaveProperty("version");
    expect(res.body).toHaveProperty("server_time");
    expect(res.body).toHaveProperty("response_time_ms");
    expect(typeof res.body.status).toBe("string");
    expect(typeof res.body.database).toBe("string");
    expect(typeof res.body.response_time_ms).toBe("number");
  });

  it("should not require authentication", async () => {
    const res = await request(app).get("/health");

    // Should succeed even without Authorization header
    expect(res.status).toBe(200);
  });
});
