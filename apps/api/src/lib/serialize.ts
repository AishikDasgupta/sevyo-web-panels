import type {
  AdminStats,
  Booking,
  Caregiver,
  FamilyContact,
  Review,
  Service,
  UserProfile,
  Vendor,
} from '@sevyo/shared-types';
import type {
  Booking as PrismaBooking,
  Caregiver as PrismaCaregiver,
  FamilyContact as PrismaFamilyContact,
  Review as PrismaReview,
  Service as PrismaService,
  User as PrismaUser,
  Vendor as PrismaVendor,
} from '@prisma/client';

type WithNames = PrismaBooking & {
  user?: PrismaUser | null;
  caregiver?: (PrismaCaregiver & { user?: PrismaUser | null }) | null;
  vendor?: PrismaVendor | null;
  service?: PrismaService | null;
};

const s = (value: BigInt): string => value.toString();
const n = (value: unknown): number => Number(value ?? 0);
const iso = (value: Date | null): string | null => (value ? value.toISOString() : null);

export function serializeService(service: PrismaService): Service {
  return {
    id: s(service.id),
    name: service.name,
    category: service.category,
    isActive: service.isActive,
  };
}

export function serializeUser(user: PrismaUser): UserProfile {
  return {
    id: s(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone,
    defaultAddress: user.defaultAddress,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeVendor(
  vendor: PrismaVendor & { _count?: { caregivers: number } },
): Vendor {
  return {
    id: s(vendor.id),
    userId: s(vendor.userId),
    agencyName: vendor.agencyName,
    logoUrl: vendor.logoUrl,
    location: vendor.location,
    contactEmail: vendor.contactEmail,
    contactPhone: vendor.contactPhone,
    status: vendor.status,
    rating: n(vendor.rating),
    revenueTotal: n(vendor.revenueTotal),
    memberSince: iso(vendor.memberSince)?.slice(0, 10) ?? null,
    caregiverCount: vendor._count ? vendor._count.caregivers : undefined,
  };
}

export interface CaregiverWithRelations extends PrismaCaregiver {
  user?: PrismaUser | null;
  vendor?: PrismaVendor | null;
  specializations?: Array<{ specialization: { name: string } }>;
}

export function serializeCaregiver(caregiver: CaregiverWithRelations): Caregiver {
  return {
    id: s(caregiver.id),
    userId: s(caregiver.userId),
    vendorId: caregiver.vendorId ? s(caregiver.vendorId) : null,
    type: caregiver.type,
    pricePerHour: n(caregiver.pricePerHour),
    bio: caregiver.bio,
    experienceYears: caregiver.experienceYears,
    rating: n(caregiver.rating),
    reviewsCount: caregiver.reviewsCount,
    available: caregiver.available,
    verified: caregiver.verified,
    name: caregiver.user?.name ?? undefined,
    avatarUrl: caregiver.user?.avatarUrl ?? null,
    vendorName: caregiver.vendor?.agencyName ?? null,
    specializations: caregiver.specializations?.map((cs) => cs.specialization.name) ?? [],
  };
}

export function serializeBooking(booking: WithNames): Booking {
  const scheduledTime = booking.scheduledTime;
  const hh = String(scheduledTime.getUTCHours()).padStart(2, '0');
  const mm = String(scheduledTime.getUTCMinutes()).padStart(2, '0');
  return {
    id: s(booking.id),
    userId: s(booking.userId),
    caregiverId: booking.caregiverId ? s(booking.caregiverId) : null,
    vendorId: booking.vendorId ? s(booking.vendorId) : null,
    serviceId: s(booking.serviceId),
    scheduledDate: booking.scheduledDate.toISOString().slice(0, 10),
    scheduledTime: `${hh}:${mm}`,
    durationHours: n(booking.durationHours),
    visitLocation: booking.visitLocation,
    address: booking.address,
    status: booking.status,
    paymentMethod: booking.paymentMethod,
    paymentStatus: booking.paymentStatus,
    price: n(booking.price),
    notes: booking.notes,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    userName: booking.user?.name ?? undefined,
    userPhone: booking.user?.phone ?? undefined,
    caregiverName: booking.caregiver?.user?.name ?? undefined,
    vendorName: booking.vendor?.agencyName ?? undefined,
    serviceName: booking.service?.name ?? undefined,
  };
}

export function serializeReview(
  review: PrismaReview & {
    user?: PrismaUser | null;
    caregiver?: (PrismaCaregiver & { user?: PrismaUser | null }) | null;
    vendor?: PrismaVendor | null;
  },
): Review {
  return {
    id: s(review.id),
    bookingId: s(review.bookingId),
    userId: s(review.userId),
    caregiverId: review.caregiverId ? s(review.caregiverId) : null,
    vendorId: review.vendorId ? s(review.vendorId) : null,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    userName: review.user?.name ?? undefined,
    caregiverName: review.caregiver?.user?.name ?? undefined,
    vendorName: review.vendor?.agencyName ?? undefined,
  };
}

export function serializeFamilyContact(contact: PrismaFamilyContact): FamilyContact {
  return {
    id: s(contact.id),
    userId: s(contact.userId),
    name: contact.name,
    phone: contact.phone,
    createdAt: contact.createdAt.toISOString(),
  };
}

export function serializeStats(stats: AdminStats): AdminStats {
  return stats;
}
