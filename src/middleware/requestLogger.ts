import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

/**
 * Logs every HTTP request with method, url, status, and duration.
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      type: "request",
      correlationId: req.correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });

  next();
}
