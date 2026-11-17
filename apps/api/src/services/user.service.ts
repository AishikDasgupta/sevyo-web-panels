import { prisma } from '../lib/prisma';
import { badRequest, notFound, unauthorized } from '../lib/errors';
import { hashPassword, verifyPassword } from '../lib/password';
import { serializeFamilyContact, serializeUser } from '../lib/serialize';
import type { UpdateProfileInput, ChangePasswordInput } from '../schemas/user.schema';

export async function getProfile(userId: bigint) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('User not found');
  return serializeUser(user);
}

export async function updateProfile(userId: bigint, input: UpdateProfileInput) {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.defaultAddress !== undefined) data.defaultAddress = input.defaultAddress;
  if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
  if (input.password !== undefined) data.passwordHash = await hashPassword(input.password);

  const user = await prisma.user.update({ where: { id: userId }, data });
  return serializeUser(user);
}

export async function changePassword(userId: bigint, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('User not found');

  const ok = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!ok) throw unauthorized('Current password is incorrect');

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });
}

// ---- Family contacts (SOS) ----

export async function listFamilyContacts(userId: bigint) {
  const contacts = await prisma.familyContact.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return contacts.map(serializeFamilyContact);
}

export async function createFamilyContact(userId: bigint, name: string, phone: string) {
  const count = await prisma.familyContact.count({ where: { userId } });
  if (count >= 10) throw badRequest('Family contact limit reached (10)');
  const contact = await prisma.familyContact.create({ data: { userId, name, phone } });
  return serializeFamilyContact(contact);
}

export async function deleteFamilyContact(userId: bigint, contactId: bigint) {
  const contact = await prisma.familyContact.findUnique({ where: { id: contactId } });
  if (!contact || contact.userId !== userId) throw notFound('Contact not found');
  await prisma.familyContact.delete({ where: { id: contactId } });
}