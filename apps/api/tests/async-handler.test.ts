import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../src/lib/async-handler';

describe('asyncHandler', () => {
  it('forwards rejections to next instead of crashing', async () => {
    const err = new Error('boom');
    const next = vi.fn() as unknown as NextFunction;
    const handler = asyncHandler(async () => {
      throw err;
    });
    handler({} as Request, {} as Response, next);
    await new Promise(setImmediate);
    expect(next).toHaveBeenCalledWith(err);
  });

  it('does not call next when the handler succeeds', async () => {
    const next = vi.fn() as unknown as NextFunction;
    const handler = asyncHandler(async () => 'ok');
    handler({} as Request, {} as Response, next);
    await new Promise(setImmediate);
    expect(next).not.toHaveBeenCalled();
  });
});
