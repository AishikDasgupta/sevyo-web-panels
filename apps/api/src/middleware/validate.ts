import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';
import { unprocessable } from '../lib/errors';

/**
 * Validates `req.body` (or `req.query` for GETs) against a Zod schema.
 * The parsed (and coerced/transformed) value replaces the original so
 * controllers work with clean data.
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(unprocessable('Validation failed', flatten(result.error)));
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(unprocessable('Invalid query parameters', flatten(result.error)));
      return;
    }
    Object.defineProperty(req, 'query', { value: result.data, writable: true });
    next();
  };
}

function flatten(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  return error.issues.map((issue) => ({
    field: issue.path.map(String).join('.') || '(root)',
    message: issue.message,
  }));
}
