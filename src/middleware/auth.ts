import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../lib/errors";
import { validApiKeys, env } from "../config/env";
import { verifyJwt, type JwtPayload } from "../lib/jwt";

export type AuthRole = "branch" | "ops" | "admin" | "public";

/**
 * Authenticates requests using **both** a JWT and an API key.
 *
 * ## Required Headers
 *
 * | Header | Contents |
 * |---|---|
 * | `Authorization` | `Bearer <jwt-token>` — HS256 JWT with signed role claim |
 * | `X-API-Key` | `<api-key>` — configured in API_KEYS env var |
 *
 * ## How It Works
 *
 * ```
 * Authorization: Bearer <jwt>    X-API-Key: <key>
 *         │                              │
 *         ▼                              ▼
 *   verifyJwt(jwt, JWT_SECRET)     validApiKeys.has(key)
 *         │                              │
 *         ▼                              ▼
 *   Extract role from payload       API key is valid
 *         │                              │
 *         └──────────┬───────────────────┘
 *                    ▼
 *          Both valid? role ∈ allowedRoles?
 *                    │
 *              ┌─────┴─────┐
 *              ▼             ▼
 *            YES            NO
 *              │             │
 *              ▼             ▼
 *          next()     401 / 403
 *   ```
 *
 * **The JWT role is the source of truth for authorization** — it's cryptographically
 * signed and cannot be tampered with. The API key is a second factor proving the
 * client is a legitimate system.
 *
 * Both credentials MUST be valid. If either is missing or invalid → 401.
 * If the JWT role is not permitted for the endpoint → 403.
 */
export function authenticate(allowedRoles: AuthRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Allow public access if "public" is in allowedRoles
    if (allowedRoles.includes("public")) {
      return next();
    }

    // ── 1. Verify JWT from Authorization header ──

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new UnauthorizedError("Missing or invalid Authorization header — Bearer JWT required"),
      );
    }

    const jwtToken = authHeader.slice(7).trim();

    const payload: JwtPayload | null = verifyJwt(jwtToken, env.JWT_SECRET);

    if (!payload) {
      return next(new UnauthorizedError("Invalid or expired JWT"));
    }

    const role = payload.role;

    // ── 2. Verify API key from X-API-Key header ──

    const apiKey = req.headers["x-api-key"] as string | undefined;

    if (!apiKey || apiKey.trim().length === 0) {
      return next(new UnauthorizedError("Missing X-API-Key header"));
    }

    if (!validApiKeys.has(apiKey.trim())) {
      return next(new UnauthorizedError("Invalid API key"));
    }

    // ── 3. Check authorization ──

    if (!allowedRoles.includes(role as AuthRole)) {
      return next(
        new ForbiddenError(`Role '${role}' not permitted for this endpoint`),
      );
    }

    // ── Attach auth context for downstream use ──

    (req as any).authRole = role;
    (req as any).authMethod = "jwt+api-key";
    (req as any).apiKeyRole = validApiKeys.get(apiKey.trim());

    return next();
  };
}

/**
 * Convenience middleware for public endpoints (no auth required).
 */
export function publicAccess(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next();
}
