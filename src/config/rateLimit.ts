/**
 * Rate limit configuration — per-role × per-endpoint matrix.
 *
 * Values are requests per minute.
 * Admin is unlimited (rate limiter is skipped entirely for admin role).
 */

export interface RateLimitConfig {
  /** Key format: "METHOD:/path" (e.g. "POST:/api/vehicles", "GET:/api/vehicles") */
  [endpointKey: string]: {
    /** Requests per minute per role. "default" is the fallback. */
    [role: string]: number;
  };
}

export const RATE_LIMITS: RateLimitConfig = {
  "POST:/api/vehicles": {
    admin: Infinity,
    branch: 100,
    default: 30,
  },
  "GET:/api/vehicles": {
    admin: Infinity,
    ops: 300,
    default: 60,
  },
  "GET:/api/vehicles/detail": {
    admin: Infinity,
    ops: 300,
    default: 60,
  },
  "GET:/api/dashboard/summary": {
    admin: Infinity,
    ops: 300,
    default: 60,
  },
  "GET:/api/integration-logs": {
    admin: Infinity,
    default: 30,
  },
  "GET:/health": {
    public: 120,
    admin: Infinity,
    default: 60,
  },
};

/** Fallback rate limit (requests per minute) when no specific config matches. */
export const DEFAULT_RATE_LIMIT = 60;

/**
 * Resolve the rate limit for a given role and endpoint.
 * Returns the requests-per-minute limit. Infinity means unlimited.
 */
export function getRateLimit(role: string, endpointKey: string): number {
  const endpointConfig = RATE_LIMITS[endpointKey];
  if (!endpointConfig) {
    // No specific config for this endpoint — use default
    const defaultConfig = RATE_LIMITS["default"] ?? {};
    return defaultConfig[role] ?? DEFAULT_RATE_LIMIT;
  }

  // Check role-specific limit, then "default" fallback within the endpoint config
  if (role in endpointConfig) {
    return endpointConfig[role];
  }

  return endpointConfig["default"] ?? DEFAULT_RATE_LIMIT;
}

/** 60 seconds in milliseconds */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
