import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import type { ApiError } from '@sevyo/shared-types';
import { AppError } from '../lib/errors';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    const body: ApiError = {
      error: { message: err.message, code: err.code, ...(err.details !== undefined ? { details: err.details } : {}) },
    };
    res.status(err.status).json(body);
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.issues.map((issue) => ({
          field: issue.path.map(String).join('.') || '(root)',
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: { message: 'That value is already taken', code: 'CONFLICT' } });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: { message: 'Resource not found', code: 'NOT_FOUND' } });
      return;
    }
  }

  console.error('[api] unhandled error:', err);
  res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL' } });
}