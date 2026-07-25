import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      requestStartTime: number;
    }
  }
}

/**
 * Attaches a unique correlation_id to every request for traceability.
 * Also records the request start time for duration calculation.
 */
export function correlationId(req: Request, res: Response, next: NextFunction): void {
  req.correlationId = (req.headers["x-correlation-id"] as string) || uuidv4();
  req.requestStartTime = Date.now();
  res.setHeader("x-correlation-id", req.correlationId);
  next();
}
