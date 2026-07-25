/**
 * Base application error. All custom errors extend this.
 * statusCode maps to HTTP response codes.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/** HTTP 400 — invalid input from client */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, 400);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/** HTTP 401 — missing or invalid credentials */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/** HTTP 403 — authenticated but insufficient permissions */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/** HTTP 404 — resource not found */
export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/** HTTP 409 — conflict (e.g. duplicate chassis_number) */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
