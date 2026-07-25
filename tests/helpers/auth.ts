import { signJwt } from "../../src/lib/jwt";

/**
 * Fixed test secret — must match JWT_SECRET in .env.test.
 * Used to generate valid JWTs for integration tests.
 */
export const TEST_JWT_SECRET = "test-jwt-secret-for-integration-tests-64-chars-long!!";

/**
 * Test API keys — must match API_KEYS in .env.test.
 */
export const TEST_API_KEYS = {
  admin: "test-admin-api-key",
  ops: "test-ops-api-key",
  branch: "test-branch-api-key",
} as const;

/**
 * Returns dual auth headers required by Phase 4.
 *
 * Both headers are mandatory:
 *  - Authorization: Bearer <jwt>   → signed JWT with role claim
 *  - X-API-Key: <api-key>          → valid API key from config
 */
export function authHeaders(role: "admin" | "ops" | "branch"): Record<string, string> {
  const jwt = signJwt({ role }, TEST_JWT_SECRET);
  const apiKey = TEST_API_KEYS[role];

  return {
    Authorization: `Bearer ${jwt}`,
    "X-API-Key": apiKey,
  };
}

/**
 * Returns only the JWT Bearer header (for testing missing-API-key scenarios).
 */
export function jwtOnlyHeader(role: "admin" | "ops" | "branch"): Record<string, string> {
  const jwt = signJwt({ role }, TEST_JWT_SECRET);
  return { Authorization: `Bearer ${jwt}` };
}

/**
 * Returns only the API key header (for testing missing-JWT scenarios).
 */
export function apiKeyOnlyHeader(role: "admin" | "ops" | "branch"): Record<string, string> {
  return { "X-API-Key": TEST_API_KEYS[role] };
}
