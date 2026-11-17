import type { Request, Response } from 'express';
import * as vendorService from '../services/vendor.service';

export async function myVendor(req: Request, res: Response) {
  res.json(await vendorService.myVendor(req.user!.id));
}

export async function createMine(req: Request, res: Response) {
  res.status(201).json(await vendorService.createVendor(req.user!.id, req.body));
}

export async function updateOne(req: Request, res: Response) {
  res.json(await vendorService.updateVendor(req.user!.id, BigInt(req.params.id), req.body));
}