import { prisma } from '../lib/prisma';
import { conflict, forbidden, notFound } from '../lib/errors';
import { serializeVendor } from '../lib/serialize';
import type { UpsertVendorInput } from '../schemas/vendor.schema';

export async function myVendor(userId: bigint) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: { _count: { select: { caregivers: true } } },
  });
  return vendor ? serializeVendor(vendor) : null;
}

export async function createVendor(userId: bigint, input: UpsertVendorInput) {
  const existing = await prisma.vendor.findUnique({ where: { userId } });
  if (existing) throw conflict('Vendor profile already exists for this account');

  const vendor = await prisma.vendor.create({
    data: {
      userId,
      agencyName: input.agencyName,
      location: input.location ?? null,
      contactEmail: input.contactEmail ?? null,
      contactPhone: input.contactPhone ?? null,
      logoUrl: input.logoUrl ?? null,
      memberSince: new Date(),
    },
    include: { _count: { select: { caregivers: true } } },
  });
  return serializeVendor(vendor);
}

export async function updateVendor(userId: bigint, vendorId: bigint, input: Partial<UpsertVendorInput>) {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw notFound('Vendor not found');
  if (vendor.userId !== userId) throw forbidden('Not your vendor profile');

  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      ...(input.agencyName !== undefined ? { agencyName: input.agencyName } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.contactEmail !== undefined ? { contactEmail: input.contactEmail } : {}),
      ...(input.contactPhone !== undefined ? { contactPhone: input.contactPhone } : {}),
      ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
    },
    include: { _count: { select: { caregivers: true } } },
  });
  return serializeVendor(updated);
}

// ---- Admin ----

export async function adminListVendors() {
  const vendors = await prisma.vendor.findMany({
    include: { _count: { select: { caregivers: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return vendors.map(serializeVendor);
}

export async function adminSetStatus(vendorId: bigint, status: 'active' | 'pending' | 'suspended') {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw notFound('Vendor not found');
  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: { status },
    include: { _count: { select: { caregivers: true } } },
  });
  return serializeVendor(updated);
}