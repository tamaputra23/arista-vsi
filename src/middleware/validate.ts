import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../lib/errors";
import { sanitizeObject } from "../lib/sanitize";

type ValidationTarget = "body" | "query" | "params";

interface ValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Creates a middleware that validates and sanitizes request data against Zod schemas.
 *
 * **Phase 5 enhancements:**
 * - Uses `.parseAsync()` to support async `.refine()` (DB lookups for business rules)
 * - Automatically sanitizes string values after successful validation (XSS, control chars)
 *
 * Usage:
 *   validate({ body: createVehicleSchema })
 *   validate({ query: listVehiclesQuerySchema })
 *   validate({ body: bodySchema, query: querySchema })
 */
export function validate(schemas: ValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        const parsed = await schemas.body.parseAsync(req.body);
        // Sanitize string fields after validation
        req.body = sanitizeObject(parsed);
      }
      if (schemas.query) {
        // query params are strings by default; Zod coerce handles conversion
        const parsed = await schemas.query.parseAsync(req.query);
        req.query = parsed as typeof req.query;
      }
      if (schemas.params) {
        const parsed = await schemas.params.parseAsync(req.params);
        req.params = parsed;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of err.issues) {
          const path = issue.path.join(".") || "_root";
          if (!fieldErrors[path]) fieldErrors[path] = [];
          fieldErrors[path].push(issue.message);
        }
        next(new ValidationError("Validation failed", fieldErrors));
      } else {
        next(err);
      }
    }
  };
}
