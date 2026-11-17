"use strict";
/**
 * Sevyo — shared domain types + API contracts.
 * Consumed by both `apps/web` (frontend) and `apps/api` (Express backend).
 * Keep this file dependency-free so it can be imported anywhere.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_STATUSES = exports.PAYMENT_METHODS = exports.BOOKING_VISIT_LOCATIONS = exports.BOOKING_STATUSES = exports.SERVICE_CATEGORIES = exports.CAREGIVER_TYPES = exports.VENDOR_STATUSES = exports.USER_STATUSES = exports.USER_ROLES = void 0;
/* ===== Enums (must mirror apps/api/prisma/schema.prisma) ===== */
exports.USER_ROLES = ['user', 'vendor', 'resource', 'admin'];
exports.USER_STATUSES = ['active', 'inactive', 'suspended'];
exports.VENDOR_STATUSES = ['active', 'pending', 'suspended'];
exports.CAREGIVER_TYPES = [
    'nurse',
    'caregiver',
    'physiotherapist',
    'lab',
    'mental_health',
    'elder_care',
    'pediatric',
];
exports.SERVICE_CATEGORIES = ['instant', 'scheduled', 'care'];
exports.BOOKING_STATUSES = [
    'pending',
    'broadcast',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'expired',
];
exports.BOOKING_VISIT_LOCATIONS = ['home', 'site'];
exports.PAYMENT_METHODS = ['cash', 'online'];
exports.PAYMENT_STATUSES = ['unpaid', 'pending', 'paid'];
