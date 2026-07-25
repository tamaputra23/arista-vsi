import rateLimit from "express-rate-limit";
import {
  getRateLimit,
  RATE_LIMIT_WINDOW_MS,
} from "../config/rateLimit";

/**
 * Creates an Express rate limiter middleware for a specific endpoint.
 *
 * The limiter keys requests by IP + role, so different roles from the
 * same IP get separate rate limit counters.
 *
 * Admin role is skipped entirely (unlimited).
 *
 * @param endpointKey - e.g. "POST:/api/vehicles", "GET:/api/dashboard/summary"
 */
export function createRateLimiter(endpointKey: string) {
  return rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,

    // Dynamic limit based on the request's role
    max: (req: any) => {
      const role = req.authRole || "public";
      return getRateLimit(role, endpointKey);
    },

    // Key by IP + role so different roles have separate counters
    keyGenerator: (req: any) => {
      const role = req.authRole || "public";
      return `${req.ip}-${role}`;
    },

    // Admin is unlimited
    skip: (req: any) => {
      return req.authRole === "admin";
    },

    standardHeaders: true, // Draft-6 RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers

    // Custom 429 response matching API spec
    handler: (_req, res, _next, options) => {
      const retryAfter = Math.ceil(options.windowMs / 1000);
      res.set("Retry-After", String(retryAfter));
      res.status(429).json({
        success: false,
        message: `Too many requests — please wait ${retryAfter} seconds and try again`,
      });
    },
  });
}
