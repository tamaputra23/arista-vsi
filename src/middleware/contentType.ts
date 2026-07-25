import { Request, Response, NextFunction } from "express";

/**
 * Middleware that enforces Content-Type: application/json on write methods.
 *
 * GET and HEAD requests are allowed through without a Content-Type header.
 * POST, PUT, PATCH, DELETE must include Content-Type: application/json.
 * Returns 415 Unsupported Media Type if the requirement is not met.
 */
export function requireJson(req: Request, res: Response, next: NextFunction): void {
  const method = req.method.toUpperCase();

  // GET and HEAD don't have bodies — allow through
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return next();
  }

  const contentType = req.headers["content-type"];

  if (!contentType || !contentType.includes("application/json")) {
    res.status(415).json({
      success: false,
      message: "Content-Type must be application/json for this endpoint",
    });
    return;
  }

  next();
}
