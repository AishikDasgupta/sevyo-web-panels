import crypto from 'crypto';
import type { CaregiverFilters, CaregiverType } from '@sevyo/shared-types';
import { prisma } from '../lib/prisma';
import { forbidden, notFound } from '../lib/errors';
import { serializeCaregiver, type CaregiverWithRelations } from '../lib/serialize';

export interface CreateCaregiverServiceInput {
  type: CaregiverType;
  pricePerHour: number;
  bio?: string;
  experienceYears?: number;
  available?: boolean;
  specializations?: string[];
  name?: string;
}

const INCLUDE = {
  user: true,
  vendor: true,
  specializations: { include: { specialization: true } },
} as const;

async function syncSpecializations(caregiverId: bigint, names: string[]) {
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  await prisma.caregiverSpecialization.deleteMany({ where: { caregiverId } });
  for (const name of unique) {
    const spec = await prisma.specialization.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    await prisma.caregiverSpecialization.create({
      data: { caregiverId, specializationId: spec.id },
    });
  }
}

export async function list(filters: CaregiverFilters) {
  const caregivers = await prisma.caregiver.findMany({
    where: {
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.available !== undefined ? { available: filters.available } : {}),
      ...(filters.vendorId ? { vendorId: BigInt(filters.vendorId) } : {}),
      ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
        ? {
            pricePerHour: {
              ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
              ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
            },
          }
        : {}),
      ...(filters.q
        ? { user: { name: { contains: filters.q } } } // CI via MySQL collation
        : {}),
      ...(filters.specialization
        ? {
            specializations: {
              some: { specialization: { name: { equals: filters.specialization } } },
            },
          }
        : {}),
    },
    include: INCLUDE,
    orderBy: [{ available: 'desc' }, { rating: 'desc' }],
  });
  return caregivers.map(serializeCaregiver);
}

export async function getById(id: bigint) {
  const caregiver = await prisma.caregiver.findUnique({ where: { id }, include: INCLUDE });
  if (!caregiver) throw notFound('Caregiver not found');
  return serializeCaregiver(caregiver);
}

export async function myCaregiver(userId: bigint) {
  const caregiver = await prisma.caregiver.findUnique({
    where: { userId },
    include: INCLUDE,
  });
  return caregiver ? serializeCaregiver(caregiver) : null;
}

/**
 * Vendors add roster members without a signup flow — a placeholder resource
 * account is provisioned automatically.
 */
export async function createForVendor(vendorUserId: bigint, input: CreateCaregiverServiceInput) {
  const vendor = await prisma.vendor.findUnique({ where: { userId: vendorUserId } });
  if (!vendor) throw forbidden('Complete vendor onboarding first');

  const suffix = Date.now();
  const placeholderUser = await prisma.user.create({
    data: {
      name: input.name ?? `${label(input.type)} — ${vendor.agencyName}`,
      email: `roster.${suffix}@caregivers.sevyo.local`,
      passwordHash: cryptoRandomPassword(),
      role: 'resource',
    },
  });

  const caregiver = await prisma.caregiver.create({
    data: {
      userId: placeholderUser.id,
      vendorId: vendor.id,
      type: input.type,
      pricePerHour: input.pricePerHour,
      bio: input.bio ?? null,
      experienceYears: input.experienceYears ?? 0,
      available: input.available ?? true,
    },
    include: INCLUDE,
  });

  if (input.specializations?.length) {
    await syncSpecializations(caregiver.id, input.specializations);
  }

  const fresh = await prisma.caregiver.findUnique({ where: { id: caregiver.id }, include: INCLUDE });
  return serializeCaregiver(fresh!);
}

export interface UpdateCaregiverServiceInput {
  type?: string;
  pricePerHour?: number;
  bio?: string;
  experienceYears?: number;
  available?: boolean;
  verified?: boolean;
  specializations?: string[];
}

export async function update(
  caregiverId: bigint,
  requester: { id: bigint; role: string },
  input: UpdateCaregiverServiceInput,
) {
  const caregiver = await prisma.caregiver.findUnique({ where: { id: caregiverId } });
  if (!caregiver) throw notFound('Caregiver not found');

  if (requester.role === 'vendor') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: requester.id } });
    if (!vendor || caregiver.vendorId !== vendor.id) throw forbidden('Not your roster member');
  } else if (requester.role === 'resource') {
    if (caregiver.userId !== requester.id) throw forbidden('Not your caregiver profile');
  } else if (requester.role !== 'admin') {
    throw forbidden('Insufficient role');
  }

  const updated = await prisma.caregiver.update({
    where: { id: caregiverId },
    data: {
      ...(input.type !== undefined ? { type: input.type as CaregiverWithRelations['type'] } : {}),
      ...(input.pricePerHour !== undefined ? { pricePerHour: input.pricePerHour } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.experienceYears !== undefined ? { experienceYears: input.experienceYears } : {}),
      ...(input.available !== undefined ? { available: input.available } : {}),
      ...(input.verified !== undefined ? { verified: input.verified } : {}),
    },
    include: INCLUDE,
  });

  if (input.specializations) {
    await syncSpecializations(updated.id, input.specializations);
    const fresh = await prisma.caregiver.findUnique({ where: { id: updated.id }, include: INCLUDE });
    return serializeCaregiver(fresh!);
  }
  return serializeCaregiver(updated);
}

function label(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function cryptoRandomPassword(): string {
  return crypto.randomBytes(24).toString('base64url');
}
