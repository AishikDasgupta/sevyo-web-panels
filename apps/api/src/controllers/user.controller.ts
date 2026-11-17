import type { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { badRequest } from '../lib/errors';

export async function getMe(req: Request, res: Response) {
  res.json(await userService.getProfile(req.user!.id));
}

export async function updateMe(req: Request, res: Response) {
  res.json(await userService.updateProfile(req.user!.id, req.body));
}

export async function changePassword(req: Request, res: Response) {
  await userService.changePassword(req.user!.id, req.body);
  res.status(204).send();
}

// ---- Family contacts (SOS) ----

export async function listContacts(req: Request, res: Response) {
  res.json(await userService.listFamilyContacts(req.user!.id));
}

export async function addContact(req: Request, res: Response) {
  const contact = await userService.createFamilyContact(
    req.user!.id,
    String(req.body.name ?? ''),
    String(req.body.phone ?? ''),
  );
  if (!contact) throw badRequest('Could not save contact');
  res.status(201).json(contact);
}

export async function deleteContact(req: Request, res: Response) {
  await userService.deleteFamilyContact(req.user!.id, BigInt(req.params.id));
  res.status(204).send();
}