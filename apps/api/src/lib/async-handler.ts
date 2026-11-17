import type { NextFunction, Request, Response } from 'express';

/**
 * Wraps an async Express handler so a rejected promise is forwarded to the
 * error-handling middleware instead of crashing the process (Express 4 does
 * not catch async errors by itself).
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
