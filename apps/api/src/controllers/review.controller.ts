import type { Request, Response } from 'express';
import * as reviewService from '../services/review.service';

export async function list(req: Request, res: Response) {
  const caregiverId =
    typeof req.query.caregiverId === 'string' ? req.query.caregiverId : undefined;
  res.json(await reviewService.list({ caregiverId }));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await reviewService.create(req.user!.id, req.body));
}