/**
 * Sevyo — shared domain types + API contracts.
 * Consumed by both `apps/web` (frontend) and `apps/api` (Express backend).
 * Keep this file dependency-free so it can be imported anywhere.
 */
export declare const USER_ROLES: readonly ["user", "vendor", "resource", "admin"];
export type UserRole = (typeof USER_ROLES)[number];
export declare const USER_STATUSES: readonly ["active", "inactive", "suspended"];
export type UserStatus = (typeof USER_STATUSES)[number];
export declare const VENDOR_STATUSES: readonly ["active", "pending", "suspended"];
export type VendorStatus = (typeof VENDOR_STATUSES)[number];
export declare const CAREGIVER_TYPES: readonly ["nurse", "caregiver", "physiotherapist", "lab", "mental_health", "elder_care", "pediatric"];
export type CaregiverType = (typeof CAREGIVER_TYPES)[number];
export declare const SERVICE_CATEGORIES: readonly ["instant", "scheduled", "care"];
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
export declare const BOOKING_STATUSES: readonly ["pending", "broadcast", "confirmed", "in_progress", "completed", "cancelled", "expired"];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export declare const BOOKING_VISIT_LOCATIONS: readonly ["home", "site"];
export type BookingVisitLocation = (typeof BOOKING_VISIT_LOCATIONS)[number];
export declare const PAYMENT_METHODS: readonly ["cash", "online"];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export declare const PAYMENT_STATUSES: readonly ["unpaid", "pending", "paid"];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export interface ApiError {
    error: {
        message: string;
        code: string;
        details?: unknown;
    };
}
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    phone: string | null;
}
export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface UserProfile extends AuthUser {
    defaultAddress: string | null;
    avatarUrl: string | null;
    createdAt: string;
}
export interface UpdateProfileInput {
    name?: string;
    phone?: string;
    defaultAddress?: string;
    avatarUrl?: string;
    password?: string;
}
export interface Vendor {
    id: string;
    userId: string;
    agencyName: string;
    logoUrl: string | null;
    location: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    status: VendorStatus;
    rating: number;
    revenueTotal: number;
    memberSince: string | null;
    caregiverCount?: number;
}
export interface CreateVendorInput {
    agencyName: string;
    location?: string;
    contactEmail?: string;
    contactPhone?: string;
    logoUrl?: string;
}
export interface Caregiver {
    id: string;
    userId: string;
    vendorId: string | null;
    type: CaregiverType;
    pricePerHour: number;
    bio: string | null;
    experienceYears: number;
    rating: number;
    reviewsCount: number;
    available: boolean;
    verified: boolean;
    name?: string;
    avatarUrl?: string | null;
    vendorName?: string | null;
    specializations?: string[];
}
export interface CaregiverFilters {
    type?: CaregiverType;
    minPrice?: number;
    maxPrice?: number;
    specialization?: string;
    available?: boolean;
    vendorId?: string;
    q?: string;
}
export interface CreateCaregiverInput {
    type: CaregiverType;
    pricePerHour: number;
    bio?: string;
    experienceYears?: number;
    available?: boolean;
    vendorId?: string | null;
    specializations?: string[];
}
export interface Service {
    id: string;
    name: string;
    category: ServiceCategory;
    isActive: boolean;
}
export interface Booking {
    id: string;
    userId: string;
    caregiverId: string | null;
    vendorId: string | null;
    serviceId: string;
    scheduledDate: string;
    scheduledTime: string;
    durationHours: number;
    visitLocation: BookingVisitLocation;
    address: string | null;
    status: BookingStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    price: number;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    userName?: string;
    userPhone?: string | null;
    caregiverName?: string | null;
    vendorName?: string | null;
    serviceName?: string;
}
export interface CreateBookingInput {
    serviceId: string;
    caregiverId?: string | null;
    scheduledDate: string;
    scheduledTime: string;
    durationHours?: number;
    visitLocation?: BookingVisitLocation;
    address?: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
}
export interface Review {
    id: string;
    bookingId: string;
    userId: string;
    caregiverId: string | null;
    vendorId: string | null;
    rating: number;
    comment: string | null;
    createdAt: string;
    userName?: string;
    caregiverName?: string | null;
    vendorName?: string | null;
}
export interface FamilyContact {
    id: string;
    userId: string;
    name: string;
    phone: string;
    createdAt: string;
}
export interface AdminStats {
    totalRevenue: number;
    monthlyRevenue: number;
    totalBookings: number;
    activeBookings: number;
    totalUsers: number;
    totalCaregivers: number;
    totalVendors: number;
    satisfactionRate: number;
    revenueByMonth: {
        month: string;
        revenue: number;
    }[];
    bookingsByType: {
        name: string;
        value: number;
        color: string;
    }[];
}
export interface AppNotification {
    id: string;
    userId: string;
    title: string;
    body: string | null;
    link: string | null;
    read: boolean;
    createdAt: string;
}
export interface NotificationsResponse {
    notifications: AppNotification[];
    unreadCount: number;
}
export interface RazorpayOrderResponse {
    orderId: string;
    /** Amount in paise (INR × 100). */
    amount: number;
    currency: string;
    /** Publishable Razorpay key id for the checkout widget. */
    keyId: string;
    bookingId: string;
}
export interface RazorpayVerifyInput {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}
export interface ApiAuthResponse {
    user: AuthUser;
}
