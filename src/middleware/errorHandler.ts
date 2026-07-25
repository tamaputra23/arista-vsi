import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../lib/errors";
import { logger } from "../lib/logger";

/**
 * Global error handler. Catches all errors (operational and unexpected)
 * and formats them consistently per the API spec.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  if (err instanceof AppError && err.isOperational) {
    logger.warn({
      message: err.message,
      correlationId: req.correlationId,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error({
      message: err.message,
      stack: err.stack,
      correlationId: req.correlationId,
      path: req.path,
      method: req.method,
    });
  }

  // Determine status code and response
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unexpected error — don't leak details in production
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
}
