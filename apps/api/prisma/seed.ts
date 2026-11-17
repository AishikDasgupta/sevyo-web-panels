/**
 * Sevyo — database seed.
 * Replaces the mock arrays in `legacy-static/js/data.js` with real relational rows.
 *
 * Run: npm run db:seed  (after `prisma migrate dev`)
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password';

const prisma = new PrismaClient();

const INSTANT_SERVICES = [
  'IV Cannulation',
  'IM / SC Injection',
  'IV Injection',
  'Multi-Vitamin IV',
  'Electrolyte IV (NS/RL/DNS)',
  'Major Dressing',
  'Minor Wound Dressing',
  'Diabetic Foot Ulcer Dressing',
  "Foley's Catheter Remove",
  "Foley's Catheter Insert",
  "Ryle's Tube",
  'Enema Service',
  'Bedsore Dressing',
  'Albumin Injection',
  'Suture Removal / Care',
  'Antibiotic IV',
];

const SCHEDULED_SERVICES = [
  'Post-surgery care',
  'Daily elder care',
  'Physical therapy',
  'Child vaccination support',
  'Diabetic monitoring',
  'Dementia care',
  'Newborn care',
  'Sports rehab',
];

const SPECIALIZATIONS = [
  'Post-surgery care',
  'Wound management',
  'IV therapy',
  'Sports rehab',
  'Geriatric therapy',
  'Pain management',
  'Dementia care',
  'Companionship',
  'Meal preparation',
  'Fall prevention',
  'Medication management',
  'Mobility assistance',
  'Newborn care',
  'Vaccination support',
  'Child development',
  'Anxiety support',
  'Depression care',
  'CBT techniques',
  'Diabetic care',
  'BP monitoring',
  'Chronic illness',
  'Bathing assistance',
  'Light housekeeping',
];

interface SeedUser {
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'vendor' | 'resource' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
  defaultAddress?: string;
}

const USERS: SeedUser[] = [
  { name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', role: 'user', defaultAddress: '123 Main St, Mumbai' },
  { name: 'Mary Smith', email: 'mary@example.com', phone: '+91 98111 22334', role: 'user', defaultAddress: '456 Oak Ave, Bengaluru' },
  { name: 'Robert Brown', email: 'robert@example.com', phone: '+91 99000 55667', role: 'user', defaultAddress: '789 Pine Rd, Delhi' },
  { name: 'Alice Green', email: 'alice@example.com', phone: '+91 91234 56789', role: 'user', defaultAddress: '321 Elm St, Mumbai' },
  { name: 'Tom White', email: 'tom@example.com', phone: '+91 94560 77881', role: 'user', status: 'inactive' },
  // Vendors (agency owners)
  { name: 'Amit Shah', email: 'admin@healthfirst.com', phone: '+91 98765 43210', role: 'vendor' },
  { name: 'Neha Kapoor', email: 'info@carewell.com', phone: '+91 98111 22334', role: 'vendor' },
  { name: 'Rajesh Iyer', email: 'hello@seniorcare.com', phone: '+91 99000 55667', role: 'vendor' },
  { name: 'Sneha Desai', email: 'ops@nurseoncall.com', phone: '+91 91234 56789', role: 'vendor' },
  // Caregivers (resource)
  { name: 'Sarah Johnson', email: 'sarah@sevyo.co.in', phone: '+91 90000 00001', role: 'resource' },
  { name: 'Michael Chen', email: 'michael@sevyo.co.in', phone: '+91 90000 00002', role: 'resource' },
  { name: 'Emily Rodriguez', email: 'emily@sevyo.co.in', phone: '+91 90000 00003', role: 'resource' },
  { name: 'David Kim', email: 'david@sevyo.co.in', phone: '+91 90000 00004', role: 'resource' },
  { name: 'Lisa Patel', email: 'lisa@sevyo.co.in', phone: '+91 90000 00005', role: 'resource' },
  { name: 'James Wilson', email: 'james@sevyo.co.in', phone: '+91 90000 00006', role: 'resource' },
  { name: 'Anna Martinez', email: 'anna@sevyo.co.in', phone: '+91 90000 00007', role: 'resource' },
  { name: 'Robert Taylor', email: 'robert.t@sevyo.co.in', phone: '+91 90000 00008', role: 'resource' },
  // Admin
  { name: 'Sevyo Admin', email: 'admin@sevyo.co.in', phone: '+91 90000 00000', role: 'admin' },
];

const VENDOR_SEED = [
  { agencyName: 'HealthFirst Agency', location: 'Mumbai, MH', contactEmail: 'admin@healthfirst.com', contactPhone: '+91 98765 43210', status: 'active' as const },
  { agencyName: 'CareWell Partners', location: 'Delhi, IN', contactEmail: 'info@carewell.com', contactPhone: '+91 98111 22334', status: 'active' as const },
  { agencyName: 'SeniorCare Plus', location: 'Bengaluru, KA', contactEmail: 'hello@seniorcare.com', contactPhone: '+91 99000 55667', status: 'active' as const },
  { agencyName: 'NurseOnCall', location: 'Pune, MH', contactEmail: 'ops@nurseoncall.com', contactPhone: '+91 91234 56789', status: 'pending' as const },
];

const CAREGIVER_SEED = [
  { name: 'Sarah Johnson', type: 'nurse' as const, price: 550, experience: 8, available: true, verified: true, specs: ['Post-surgery care', 'Wound management', 'IV therapy'], bio: 'Dedicated RN with 8 years of home healthcare experience. Specialized in post-operative and chronic care.' },
  { name: 'Michael Chen', type: 'physiotherapist' as const, price: 650, experience: 6, available: true, verified: true, specs: ['Sports rehab', 'Geriatric therapy', 'Pain management'], bio: 'Sports rehabilitation expert helping patients recover mobility and strength.' },
  { name: 'Emily Rodriguez', type: 'caregiver' as const, price: 350, experience: 10, available: false, verified: true, specs: ['Dementia care', 'Companionship', 'Meal preparation'], bio: 'Compassionate caregiver specializing in dementia and Alzheimer care.' },
  { name: 'David Kim', type: 'elder_care' as const, price: 450, experience: 12, available: true, verified: true, specs: ['Fall prevention', 'Medication management', 'Mobility assistance'], bio: 'Veteran elder care specialist ensuring dignity and comfort for seniors.' },
  { name: 'Lisa Patel', type: 'pediatric' as const, price: 600, experience: 7, available: true, verified: true, specs: ['Newborn care', 'Vaccination support', 'Child development'], bio: 'Pediatric nurse passionate about children health and well-being.' },
  { name: 'James Wilson', type: 'mental_health' as const, price: 500, experience: 5, available: true, verified: false, specs: ['Anxiety support', 'Depression care', 'CBT techniques'], bio: 'Mental health aide providing compassionate emotional and psychological support.' },
  { name: 'Anna Martinez', type: 'nurse' as const, price: 600, experience: 11, available: true, verified: true, specs: ['Diabetic care', 'BP monitoring', 'Chronic illness'], bio: 'Experienced RN with focus on chronic disease management and patient education.' },
  { name: 'Robert Taylor', type: 'caregiver' as const, price: 300, experience: 4, available: true, verified: false, specs: ['Mobility assistance', 'Bathing assistance', 'Light housekeeping'], bio: 'Reliable caregiver providing daily living assistance with a warm approach.' },
];

const FAMILY_CONTACTS = [
  { name: 'Spouse', phone: '+91 98111 22334' },
  { name: 'Son / Daughter', phone: '+91 99000 55667' },
  { name: 'Sibling', phone: '+91 91234 56789' },
];

async function main() {
  console.log('[seed] starting…');

  const passwordHash = await hashPassword('sevyo123');

  // ---- Services
  for (const name of INSTANT_SERVICES) {
    await prisma.service.upsert({ where: { name }, update: {}, create: { name, category: 'instant' } });
  }
  for (const name of SCHEDULED_SERVICES) {
    await prisma.service.upsert({ where: { name }, update: {}, create: { name, category: 'scheduled' } });
  }
  console.log(`[seed] services: ${INSTANT_SERVICES.length + SCHEDULED_SERVICES.length}`);

  // ---- Specializations
  for (const name of SPECIALIZATIONS) {
    await prisma.specialization.upsert({ where: { name }, update: {}, create: { name } });
  }

  // ---- Users (all roles)
  const userRows: Record<string, { id: bigint; role: string }> = {};
  for (const u of USERS) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash,
        role: u.role,
        status: u.status ?? 'active',
        defaultAddress: u.defaultAddress ?? null,
      },
    });
    userRows[u.email] = { id: created.id, role: created.role };
  }
  console.log(`[seed] users: ${USERS.length}`);

  // ---- Vendors (agency owners = users with role vendor)
  const vendorRows: bigint[] = [];
  const vendorUsers = USERS.filter((u) => u.role === 'vendor');
  for (let i = 0; i < vendorUsers.length; i++) {
    const v = VENDOR_SEED[i];
    const vendor = await prisma.vendor.upsert({
      where: { userId: userRows[vendorUsers[i].email].id },
      update: {},
      create: {
        userId: userRows[vendorUsers[i].email].id,
        agencyName: v.agencyName,
        location: v.location,
        contactEmail: v.contactEmail,
        contactPhone: v.contactPhone,
        status: v.status,
        rating: [4.8, 4.7, 4.6, 4.4][i],
        memberSince: new Date(`${2020 + i}-01-15T00:00:00.000Z`),
      },
    });
    vendorRows.push(vendor.id);
  }
  console.log(`[seed] vendors: ${vendorRows.length}`);

  // ---- Caregivers (resource users, assigned round-robin to agencies)
  const caregiverUserEmails = USERS.filter((u) => u.role === 'resource').map((u) => u.email);
  const specByName = new Map(
    (await prisma.specialization.findMany()).map((s) => [s.name, s.id]),
  );

  for (let i = 0; i < CAREGIVER_SEED.length; i++) {
    const c = CAREGIVER_SEED[i];
    const userId = userRows[caregiverUserEmails[i]].id;
    const vendorId = i % 3 === 2 ? null : vendorRows[i % 3]; // some independents

    const caregiver = await prisma.caregiver.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        vendorId,
        type: c.type,
        pricePerHour: c.price,
        bio: c.bio,
        experienceYears: c.experience,
        rating: [4.9, 4.8, 4.7, 4.9, 4.8, 4.6, 4.9, 4.5][i],
        reviewsCount: [127, 89, 203, 156, 94, 67, 178, 112][i],
        available: c.available,
        verified: c.verified,
      },
    });

    await prisma.caregiverSpecialization.createMany({
      data: c.specs.map((name) => ({
        caregiverId: caregiver.id,
        specializationId: specByName.get(name)!,
      })),
      skipDuplicates: true,
    });
  }
  console.log(`[seed] caregivers: ${CAREGIVER_SEED.length}`);

  // ---- Bookings (mirror data.js BOOKINGS)
  const servicesByName = new Map((await prisma.service.findMany()).map((s) => [s.name, s.id]));
  const caregivers = await prisma.caregiver.findMany({ include: { user: true, vendor: true } });
  const users = await prisma.user.findMany({ where: { role: 'user' } });

  const bookingSeed = [
    { user: 'john@example.com', caregiver: 'Sarah Johnson', service: 'Post-surgery care', date: '2026-07-24', time: '09:00', dur: 4, status: 'confirmed', price: 2200, pay: 'cash', payStatus: 'pending' },
    { user: 'mary@example.com', caregiver: 'David Kim', service: 'Daily elder care', date: '2026-07-24', time: '10:00', dur: 6, status: 'in_progress', price: 2700, pay: 'online', payStatus: 'paid' },
    { user: 'robert@example.com', caregiver: 'Michael Chen', service: 'Physical therapy', date: '2026-07-25', time: '14:00', dur: 2, status: 'pending', price: 1300, pay: 'cash', payStatus: 'pending' },
    { user: 'john@example.com', caregiver: 'Lisa Patel', service: 'Child vaccination support', date: '2026-07-22', time: '11:00', dur: 1, status: 'completed', price: 600, pay: 'online', payStatus: 'paid' },
    { user: 'alice@example.com', caregiver: 'Anna Martinez', service: 'Diabetic monitoring', date: '2026-07-26', time: '08:00', dur: 3, status: 'confirmed', price: 1800, pay: 'cash', payStatus: 'pending' },
    { user: 'tom@example.com', caregiver: 'Emily Rodriguez', service: 'Dementia care', date: '2026-07-21', time: '07:00', dur: 8, status: 'completed', price: 2800, pay: 'cash', payStatus: 'paid' },
    { user: 'john@example.com', caregiver: null, service: 'IV Cannulation', date: '2026-07-24', time: '09:00', dur: 1, status: 'broadcast', price: 500, pay: 'cash', payStatus: 'pending' },
  ];

  for (const b of bookingSeed) {
    const caregiver = b.caregiver ? caregivers.find((c) => c.user.name === b.caregiver) : null;
    const user = users.find((u) => u.email === b.user)!;
    const serviceId = servicesByName.get(b.service)!;
    const [hh, mm] = b.time.split(':').map(Number);

    await prisma.booking.create({
      data: {
        userId: user.id,
        caregiverId: caregiver?.id ?? null,
        vendorId: caregiver?.vendorId ?? null,
        serviceId,
        scheduledDate: new Date(`${b.date}T00:00:00.000Z`),
        scheduledTime: new Date(Date.UTC(1970, 0, 1, hh, mm, 0)),
        durationHours: b.dur,
        visitLocation: 'home',
        address: user.defaultAddress,
        status: b.status as any,
        paymentMethod: b.pay as any,
        paymentStatus: b.payStatus as any,
        price: b.price,
      },
    });
  }
  console.log(`[seed] bookings: ${bookingSeed.length}`);

  // ---- Reviews for completed bookings
  const completedBookings = await prisma.booking.findMany({
    where: { status: 'completed' },
    include: { user: true, caregiver: true, vendor: true },
  });
  const REVIEWS = [
    { rating: 5, comment: 'Sarah was absolutely wonderful! Very professional and caring.' },
    { rating: 4, comment: 'Anna is very knowledgeable and patient. Great experience.' },
  ];
  for (let i = 0; i < completedBookings.length; i++) {
    const b = completedBookings[i];
    await prisma.review.create({
      data: {
        bookingId: b.id,
        userId: b.userId,
        caregiverId: b.caregiverId,
        vendorId: b.vendorId,
        rating: REVIEWS[i]?.rating ?? 5,
        comment: REVIEWS[i]?.comment ?? 'Excellent care and professionalism.',
      },
    });
  }
  await prisma.$executeRaw`UPDATE caregivers c
    SET c.rating = (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.caregiverId = c.id),
        c.reviews_count = (SELECT COUNT(*) FROM reviews r WHERE r.caregiverId = c.id)`;
  console.log(`[seed] reviews: ${completedBookings.length}`);

  // ---- Family contacts for John Doe (replaces localStorage SOS list)
  const john = await prisma.user.findUnique({ where: { email: 'john@example.com' } });
  if (john) {
    for (const c of FAMILY_CONTACTS) {
      await prisma.familyContact.create({ data: { userId: john.id, name: c.name, phone: c.phone } });
    }
  }
  console.log('[seed] family contacts: 3');

  // ---- Recompute vendor revenue from paid/pending completed bookings
  await prisma.$executeRaw`UPDATE vendors v
    SET v.revenue_total = COALESCE(
      (SELECT SUM(b.price) FROM bookings b WHERE b.vendorId = v.id AND b.status = 'completed' AND b.payment_status IN ('paid','pending')), 0)`;

  console.log('[seed] done ✔');
}

main()
  .catch((e) => {
    console.error('[seed] failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());