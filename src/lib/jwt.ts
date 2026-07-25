import crypto from "crypto";

// ---- Types ----

export interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

export interface JwtHeader {
  alg: string;
  typ: string;
}

const VALID_ROLES = ["admin", "ops", "branch"] as const;
const ALLOWED_ALGORITHMS = ["HS256"];
const SUBJECT = "vehicle-stock-platform";
const TOKEN_EXPIRY_SECONDS = 365 * 24 * 60 * 60; // 365 days

// ---- Helpers ----

function base64urlEncode(data: string): string {
  return Buffer.from(data, "utf-8").toString("base64url");
}

function base64urlDecode(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

// ---- Sign ----

/**
 * Creates a signed JWT using HS256 (HMAC-SHA256).
 * Uses Node.js built-in crypto — zero external dependencies.
 */
export function signJwt(payload: Omit<JwtPayload, "sub" | "iat" | "exp">, secret: string): string {
  const now = Math.floor(Date.now() / 1000);

  const fullPayload: JwtPayload = {
    sub: SUBJECT,
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS,
    ...payload,
  };

  const header: JwtHeader = { alg: "HS256", typ: "JWT" };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(fullPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64url");

  return `${signingInput}.${signature}`;
}

// ---- Verify ----

/**
 * Verifies a JWT signature and returns the decoded payload.
 * Returns `null` if the token is invalid, expired, or tampered.
 *
 * Security checks performed:
 *  - Algorithm must be HS256 (rejects "none" and other alg values)
 *  - Signature must match (timing-safe comparison)
 *  - exp claim must be in the future
 *  - role must be one of: admin, ops, branch
 *  - sub must match expected subject
 */
export function verifyJwt(token: string, secret: string): JwtPayload | null {
  // Must have exactly 3 dot-separated parts
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  // Decode header and validate algorithm
  let header: JwtHeader;
  try {
    header = JSON.parse(base64urlDecode(encodedHeader));
  } catch {
    return null;
  }

  if (!header.alg || !ALLOWED_ALGORITHMS.includes(header.alg)) {
    return null; // Reject "none" and unknown algorithms
  }

  // Verify signature (timing-safe)
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64url");

  const expectedBuf = Buffer.from(expectedSignature);
  const providedBuf = Buffer.from(encodedSignature);

  if (
    expectedBuf.length !== providedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, providedBuf)
  ) {
    return null; // Signature mismatch
  }

  // Decode payload
  let payload: JwtPayload;
  try {
    payload = JSON.parse(base64urlDecode(encodedPayload));
  } catch {
    return null;
  }

  // Validate payload fields
  if (payload.sub !== SUBJECT) {
    return null;
  }

  if (!payload.role || !VALID_ROLES.includes(payload.role as (typeof VALID_ROLES)[number])) {
    return null;
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    return null; // Expired
  }

  return payload;
}

// ---- Token Generation ----

export interface GeneratedTokens {
  admin: string;
  ops: string;
  branch: string;
}

/**
 * Generates one JWT per role. Used by the CLI script (`npm run jwt:generate`).
 */
export function generateTokens(secret: string): GeneratedTokens {
  return {
    admin: signJwt({ role: "admin" }, secret),
    ops: signJwt({ role: "ops" }, secret),
    branch: signJwt({ role: "branch" }, secret),
  };
}

// ---- Token Detection ----

/**
 * Returns true if the string looks like a JWT (3 base64url parts separated by dots).
 * Used by auth middleware to decide whether to take the JWT verification path.
 */
export function looksLikeJwt(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  // Each part should be non-empty base64url
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every((part) => part.length > 0 && base64urlRegex.test(part));
}
