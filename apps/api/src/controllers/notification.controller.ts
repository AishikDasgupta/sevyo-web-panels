import type { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';

export async function list(req: Request, res: Response) {
  res.json(await notificationService.listMine(req.user!));
}

export async function markRead(req: Request, res: Response) {
  res.json(await notificationService.markRead(BigInt(req.params.id), req.user!));
}

export async function markAllRead(req: Request, res: Response) {
  res.json(await notificationService.markAllRead(req.user!));
}
