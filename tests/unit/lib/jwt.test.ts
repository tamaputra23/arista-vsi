import crypto from "crypto";
import {
  signJwt,
  verifyJwt,
  looksLikeJwt,
  generateTokens,
} from "../../../src/lib/jwt";

// Use a fixed secret for deterministic test results
const TEST_SECRET = "test-jwt-secret-for-unit-tests-64-chars-long!!";

describe("signJwt", () => {
  it("should produce a token with 3 base64url parts separated by dots", () => {
    const token = signJwt({ role: "admin" }, TEST_SECRET);
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
    for (const part of parts) {
      expect(part).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });

  it("should include role, sub, iat, and exp in the payload", () => {
    const token = signJwt({ role: "ops" }, TEST_SECRET);
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf-8"),
    );

    expect(payload.sub).toBe("vehicle-stock-platform");
    expect(payload.role).toBe("ops");
    expect(typeof payload.iat).toBe("number");
    expect(typeof payload.exp).toBe("number");
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it("should produce different tokens for different roles", () => {
    const adminToken = signJwt({ role: "admin" }, TEST_SECRET);
    const branchToken = signJwt({ role: "branch" }, TEST_SECRET);
    expect(adminToken).not.toBe(branchToken);
  });

  it("should produce different tokens with different secrets", () => {
    const token1 = signJwt({ role: "admin" }, "secret-one");
    const token2 = signJwt({ role: "admin" }, "secret-two");
    expect(token1).not.toBe(token2);
  });
});

describe("verifyJwt", () => {
  it("should return payload for a valid token", () => {
    const token = signJwt({ role: "admin" }, TEST_SECRET);
    const payload = verifyJwt(token, TEST_SECRET);
    expect(payload).not.toBeNull();
    expect(payload!.role).toBe("admin");
    expect(payload!.sub).toBe("vehicle-stock-platform");
  });

  it("should return null for a token signed with a different secret", () => {
    const token = signJwt({ role: "admin" }, TEST_SECRET);
    const payload = verifyJwt(token, "wrong-secret");
    expect(payload).toBeNull();
  });

  it("should return null for a tampered payload", () => {
    const token = signJwt({ role: "admin" }, TEST_SECRET);
    const parts = token.split(".");
    const tamperedPayloadPart = Buffer.from(
      JSON.stringify({ sub: "hacker", role: "admin", iat: 1, exp: 9999999999 }),
    ).toString("base64url");
    const tamperedToken = `${parts[0]}.${tamperedPayloadPart}.${parts[2]}`;
    expect(verifyJwt(tamperedToken, TEST_SECRET)).toBeNull();
  });

  it("should return null for a token with alg: none", () => {
    const noneHeader = Buffer.from(
      JSON.stringify({ alg: "none", typ: "JWT" }),
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({ sub: "vehicle-stock-platform", role: "admin", iat: 1, exp: 9999999999 }),
    ).toString("base64url");
    const noneToken = `${noneHeader}.${payload}.`;
    expect(verifyJwt(noneToken, TEST_SECRET)).toBeNull();
  });

  it("should return null for an expired token", () => {
    // Create a token that expired 1 hour ago
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        sub: "vehicle-stock-platform",
        role: "ops",
        iat: now - 7200,
        exp: now - 3600,
      }),
    ).toString("base64url");
    const signingInput = `${header}.${payload}`;
    const signature = crypto
      .createHmac("sha256", TEST_SECRET)
      .update(signingInput)
      .digest("base64url");
    const expiredToken = `${signingInput}.${signature}`;

    expect(verifyJwt(expiredToken, TEST_SECRET)).toBeNull();
  });

  it("should return null for a token with missing sub", () => {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        role: "admin",
        iat: now,
        exp: now + 3600,
      }),
    ).toString("base64url");
    const signingInput = `${header}.${payload}`;
    const signature = crypto
      .createHmac("sha256", TEST_SECRET)
      .update(signingInput)
      .digest("base64url");

    expect(verifyJwt(`${signingInput}.${signature}`, TEST_SECRET)).toBeNull();
  });

  it("should return null for an empty string", () => {
    expect(verifyJwt("", TEST_SECRET)).toBeNull();
  });

  it("should return null for a non-JWT string", () => {
    expect(verifyJwt("not-a-jwt", TEST_SECRET)).toBeNull();
  });

  it("should return null for undefined role", () => {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        sub: "vehicle-stock-platform",
        role: "superuser",
        iat: now,
        exp: now + 3600,
      }),
    ).toString("base64url");
    const signingInput = `${header}.${payload}`;
    const signature = crypto
      .createHmac("sha256", TEST_SECRET)
      .update(signingInput)
      .digest("base64url");

    expect(verifyJwt(`${signingInput}.${signature}`, TEST_SECRET)).toBeNull();
  });
});

describe("generateTokens", () => {
  it("should generate valid tokens for all three roles", () => {
    const tokens = generateTokens(TEST_SECRET);

    expect(tokens.admin).toBeTruthy();
    expect(tokens.ops).toBeTruthy();
    expect(tokens.branch).toBeTruthy();

    // All should verify successfully
    expect(verifyJwt(tokens.admin, TEST_SECRET)?.role).toBe("admin");
    expect(verifyJwt(tokens.ops, TEST_SECRET)?.role).toBe("ops");
    expect(verifyJwt(tokens.branch, TEST_SECRET)?.role).toBe("branch");
  });
});

describe("looksLikeJwt", () => {
  it("should return true for a valid JWT", () => {
    const token = signJwt({ role: "admin" }, TEST_SECRET);
    expect(looksLikeJwt(token)).toBe(true);
  });

  it("should return false for a plain string", () => {
    expect(looksLikeJwt("test-key-1")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(looksLikeJwt("")).toBe(false);
  });

  it("should return false for a string with 2 dots but invalid base64url parts", () => {
    // Parts with spaces aren't valid base64url
    expect(looksLikeJwt("not valid.jwt.parts")).toBe(false);
  });

  it("should return false for a string with more than 3 parts", () => {
    expect(looksLikeJwt("a.b.c.d")).toBe(false);
  });
});
