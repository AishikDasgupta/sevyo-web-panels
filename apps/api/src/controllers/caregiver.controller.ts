import type { Request, Response } from 'express';
import * as caregiverService from '../services/caregiver.service';
import type { CaregiverFilters } from '@sevyo/shared-types';
import { CAREGIVER_TYPES } from '@sevyo/shared-types';

export async function list(req: Request, res: Response) {
  const q = req.query as Record<string, string | undefined>;
  const filters: CaregiverFilters = {};
  if (q.type && (CAREGIVER_TYPES as readonly string[]).includes(q.type)) {
    filters.type = q.type as CaregiverFilters['type'];
  }
  if (q.available === 'true') filters.available = true;
  if (q.available === 'false') filters.available = false;
  if (q.vendorId) filters.vendorId = q.vendorId;
  if (q.minPrice && !Number.isNaN(Number(q.minPrice))) filters.minPrice = Number(q.minPrice);
  if (q.maxPrice && !Number.isNaN(Number(q.maxPrice))) filters.maxPrice = Number(q.maxPrice);
  if (q.specialization) filters.specialization = q.specialization;
  if (q.q) filters.q = q.q;

  res.json(await caregiverService.list(filters));
}

export async function getOne(req: Request, res: Response) {
  res.json(await caregiverService.getById(BigInt(req.params.id)));
}

export async function me(req: Request, res: Response) {
  res.json(await caregiverService.myCaregiver(req.user!.id));
}

export async function createForVendor(req: Request, res: Response) {
  res.status(201).json(await caregiverService.createForVendor(req.user!.id, req.body));
}

export async function updateOne(req: Request, res: Response) {
  res.json(
    await caregiverService.update(BigInt(req.params.id), req.user!, req.body),
  );
}