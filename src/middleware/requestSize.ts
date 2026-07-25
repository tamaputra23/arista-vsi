import { Request, Response, NextFunction } from "express";

/**
 * Middleware that limits the raw query string length.
 * Express/Node parse query strings automatically, but very long query strings
 * can consume server resources before they're parsed.
 *
 * The raw URL is available as req.originalUrl. We check the query portion.
 *
 * @param maxBytes - maximum query string length in bytes (default 2048 = 2KB)
 */
export function querySizeLimit(maxBytes = 2048) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const url = req.originalUrl || req.url || "";
    const queryIndex = url.indexOf("?");

    if (queryIndex === -1) {
      // No query string
      return next();
    }

    const queryString = url.slice(queryIndex + 1);

    if (Buffer.byteLength(queryString, "utf-8") > maxBytes) {
      res.status(413).json({
        success: false,
        message: `Query string too large — maximum ${maxBytes} bytes allowed`,
      });
      return;
    }

    next();
  };
}
