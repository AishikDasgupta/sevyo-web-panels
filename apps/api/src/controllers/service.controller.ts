import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { serializeService } from '../lib/serialize';

/** Public — the landing page lists instant services without auth. */
export async function list(_req: Request, res: Response) {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  res.json(services.map(serializeService));
}