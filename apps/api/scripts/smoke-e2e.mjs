/**
 * End-to-end smoke test for the full Sevyo chain:
 * patient -> vendor -> caregiver -> back to patient, plus admin, payments,
 * and notifications. Runs against a seeded dev database.
 *
 *   npm run db:reset          # fresh DB + seed (uses prisma.seed config)
 *   npm run dev               # API on :4000
 *   npm run smoke
 *
 * Requires seeded demo data (password `sevyo123` for all accounts).
 */
const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:4000';
const PASSWORD = 'sevyo123';

class Session {
  constructor() {
    this.cookies = new Map();
  }
  cookieHeader() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }
  async request(method, path, body) {
    const res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(this.cookies.size ? { Cookie: this.cookieHeader() } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const setCookies = res.headers.getSetCookie?.() ?? [];
    for (const sc of setCookies) {
      const [pair] = sc.split(';');
      const idx = pair.indexOf('=');
      this.cookies.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
    }
    let json = null;
    try {
      json = await res.json();
    } catch {
      // 204 etc.
    }
    return { status: res.status, body: json };
  }
  get(path) {
    return this.request('GET', path);
  }
  post(path, body) {
    return this.request('POST', path, body ?? {});
  }
  patch(path, body) {
    return this.request('PATCH', path, body ?? {});
  }
  async login(email) {
    const res = await this.post('/auth/login', { email, password: PASSWORD });
    if (res.status !== 200) throw new Error(`login failed for ${email}: ${res.status}`);
    return this;
  }
}

let passed = 0;
let failed = 0;
function check(name, cond, extra) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${extra !== undefined ? ` — got: ${JSON.stringify(extra)}` : ''}`);
  }
}

async function main() {
  console.log(`Smoke-testing ${BASE}\n`);

  const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
  check('API health ok', health.status === 'ok' && health.db === 'up', health);

  console.log('\n[A] Instant broadcast booking -> claim -> visit -> review');
  const john = await new Session().login('john@example.com');
  const neha = await new Session().login('neha@example.com');
  const sarah = await new Session().login('sarah@sevyo.co.in');
  const michael = await new Session().login('michael@sevyo.co.in');
  const admin = await new Session().login('admin@sevyo.co.in');
  const healthfirst = await new Session().login('admin@healthfirst.com');
  const carewell = await new Session().login('info@carewell.com');
  const seniorcare = await new Session().login('hello@seniorcare.com');
  const nurseoncall = await new Session().login('ops@nurseoncall.com');
  const emily = await new Session().login('emily@sevyo.co.in');

  check('neha login ok', (await neha.get('/users/me')).status === 200);

  const ivService = (await john.get('/services')).body.find((s) => s.name === 'IV Cannulation');
  check('catalog has IV Cannulation', Boolean(ivService));

  // A1: patient creates an instant (broadcast) cash booking
  const today = new Date();
  const date = today.toISOString().slice(0, 10);
  const created = await john.post('/bookings', {
    serviceId: String(ivService.id),
    scheduledDate: date,
    scheduledTime: '10:00',
    durationHours: 1,
    visitLocation: 'home',
    paymentMethod: 'cash',
  });
  check('patient books instant service (broadcast)', created.status === 201 && created.body.status === 'broadcast', created.body);
  const bId = created.body?.id;
  check('instant booking price is flat ₹500', created.body?.price === 500);

  // A2: pending agency must NOT see the broadcast inbox
  const nurseoncallFeed = await nurseoncall.get('/bookings');
  check('pending agency does not see broadcasts', !nurseoncallFeed.body.some((b) => b.id === bId));

  // A3: active agencies DO see it
  for (const [name, session] of [['HealthFirst', healthfirst], ['CareWell', carewell], ['SeniorCare', seniorcare]]) {
    const feed = await session.get('/bookings');
    check(`${name} sees the broadcast`, feed.body.some((b) => b.id === bId));
  }

  // A4: active agencies + admin got notified; patient did not
  for (const [name, session] of [['HealthFirst', healthfirst], ['CareWell', carewell], ['SeniorCare', seniorcare], ['Admin', admin]]) {
    const n = await session.get('/notifications');
    check(`${name} notified of the broadcast`, n.body.unreadCount >= 1 && n.body.notifications.some((x) => x.title.includes('instant booking')));
  }
  const johnN = await john.get('/notifications');
  check('patient not notified of own booking', !johnN.body.notifications.some((x) => x.title.includes('instant booking request')));

  // A5: pending agency cannot claim
  const claimPending = await nurseoncall.patch(`/bookings/${bId}/status`, { status: 'confirmed', caregiverId: 3 });
  check('pending agency claim is rejected (403)', claimPending.status === 403, claimPending.body);

  // A6: active-but-wrong-roster agency cannot assign someone else's caregiver
  const claimOther = await seniorcare.patch(`/bookings/${bId}/status`, { status: 'confirmed', caregiverId: 1 });
  check('agency cannot assign another roster’s caregiver (403)', claimOther.status === 403, claimOther.body);

  // A7: HealthFirst claims with their own nurse Sarah (id 1)
  const claim = await healthfirst.patch(`/bookings/${bId}/status`, { status: 'confirmed', caregiverId: 1 });
  check('agency claims broadcast with roster caregiver', claim.status === 200 && claim.body.status === 'confirmed' && String(claim.body.caregiverId) === '1', claim.body);
  const sarahBusy = (await admin.get('/caregivers')).body;
  check('claimed caregiver marked busy', sarahBusy.find((c) => c.id === '1')?.available === false);

  // A8: patient / caregiver / admin notified; claiming actor not self-notified
  const johnN2 = await john.get('/notifications');
  check('patient notified of confirmation', johnN2.body.notifications.some((x) => x.title === 'Booking confirmed' && x.body.includes('Sarah')));
  const sarahN = await sarah.get('/notifications');
  check('caregiver notified of assignment', sarahN.body.notifications.some((x) => x.title === 'New visit assigned'));
  const adminN = await admin.get('/notifications');
  check('admin notified of confirmation', adminN.body.notifications.some((x) => x.title === 'Booking confirmed'));

  // A9: unassigned caregiver cannot act on the visit
  const michaelTouch = await michael.patch(`/bookings/${bId}/status`, { status: 'in_progress' });
  check('unassigned caregiver blocked (403)', michaelTouch.status === 403, michaelTouch.body);

  // A10: assigned caregiver starts the visit
  const start = await sarah.patch(`/bookings/${bId}/status`, { status: 'in_progress' });
  check('caregiver starts visit', start.status === 200 && start.body.status === 'in_progress', start.body);
  const johnN3 = await john.get('/notifications');
  check('patient notified visit started', johnN3.body.notifications.some((x) => x.title === 'Your visit has started'));

  // A11: patient cannot complete their own visit
  const johnComplete = await john.patch(`/bookings/${bId}/status`, { status: 'completed' });
  check('patient cannot mark visit completed (403)', johnComplete.status === 403);

  // A12: caregiver completes -> cash collected at doorstep settles to paid
  const done = await sarah.patch(`/bookings/${bId}/status`, { status: 'completed' });
  check('caregiver completes visit', done.status === 200 && done.body.status === 'completed', done.body);
  check('cash booking settled to paid on completion', done.body.paymentStatus === 'paid');
  const healthfirstAfter = await healthfirst.get('/vendors/me');
  check('agency revenue increased by ₹500', Number(healthfirstAfter.body.revenueTotal) >= 500, healthfirstAfter.body.revenueTotal);
  const sarahFree = (await admin.get('/caregivers')).body;
  check('caregiver freed up after completion', sarahFree.find((c) => c.id === '1')?.available === true);

  // A13: patient reviews the completed visit; double review rejected
  const review = await john.post('/reviews', { bookingId: bId, rating: 5, comment: 'Sarah was wonderful' });
  check('patient reviews completed visit', review.status === 201, review.body);
  const review2 = await john.post('/reviews', { bookingId: bId, rating: 4, comment: 'second' });
  check('duplicate review rejected', review2.status === 400, review2.body);

  console.log('\n[B] Direct caregiver booking (physio, at site, online payment)');
  const date2 = date;
  const direct = await neha.post('/bookings', {
    serviceId: 19, // Physical therapy
    caregiverId: 2, // Michael Chen (CareWell, physio)
    scheduledDate: date2,
    scheduledTime: '14:00',
    durationHours: 2,
    visitLocation: 'site',
    address: 'Care Clinic, Bandra Kurla Complex, Mumbai',
    paymentMethod: 'online',
  });
  check('patient books caregiver directly (pending)', direct.status === 201 && direct.body.status === 'pending', direct.body);
  check('direct booking priced at 2× ₹650', direct.body?.price === 1300);
  const dId = direct.body?.id;

  const michaelN = await michael.get('/notifications');
  check('caregiver notified of direct booking', michaelN.body.notifications.some((x) => x.title === 'New booking assigned'));
  const carewellN = await carewell.get('/notifications');
  check('agency notified of direct booking', carewellN.body.notifications.some((x) => x.title === 'New booking on your roster'));

  // patient cannot confirm own booking; caregiver can confirm
  const nehaConfirm = await neha.patch(`/bookings/${dId}/status`, { status: 'confirmed' });
  check('patient cannot confirm own booking (403)', nehaConfirm.status === 403);
  const michaelConfirm = await michael.patch(`/bookings/${dId}/status`, { status: 'confirmed' });
  check('assigned caregiver confirms visit', michaelConfirm.status === 200 && michaelConfirm.body.status === 'confirmed', michaelConfirm.body);
  const nehaN = await neha.get('/notifications');
  check('patient notified of confirmation', nehaN.body.notifications.some((x) => x.title === 'Booking confirmed' && x.body.includes('Michael')));

  const michaelStart = await michael.patch(`/bookings/${dId}/status`, { status: 'in_progress' });
  check('caregiver starts site visit', michaelStart.status === 200);
  const michaelDone = await michael.patch(`/bookings/${dId}/status`, { status: 'completed' });
  check('caregiver completes visit', michaelDone.status === 200 && michaelDone.body.status === 'completed', michaelDone.body);
  check('online booking stays unpaid until Razorpay succeeds', michaelDone.body.paymentStatus === 'unpaid');

  console.log('\n[C] Pending agency onboarding (NurseOnCall)');
  const emilyBook = await neha.post('/bookings', {
    serviceId: 17, // Post-surgery care
    caregiverId: 3, // Emily Rodriguez (NurseOnCall — pending agency)
    scheduledDate: date2,
    scheduledTime: '09:00',
    durationHours: 4,
    visitLocation: 'home',
    paymentMethod: 'cash',
  });
  check('booking pending-agency caregiver is rejected (400)', emilyBook.status === 400, emilyBook.body);

  const adminVendors = await admin.get('/admin/vendors');
  const nroc = adminVendors.body.find((v) => v.agencyName === 'NurseOnCall');
  check('admin sees NurseOnCall as pending', nroc?.status === 'pending', nroc);
  const activate = await admin.patch(`/admin/vendors/${nroc.id}/status`, { status: 'active' });
  check('admin activates NurseOnCall', activate.status === 200, activate.body);

  const emilyBook2 = await neha.post('/bookings', {
    serviceId: 17,
    caregiverId: 3,
    scheduledDate: date2,
    scheduledTime: '09:00',
    durationHours: 4,
    visitLocation: 'home',
    paymentMethod: 'cash',
  });
  check('booking works after activation', emilyBook2.status === 201 && emilyBook2.body.status === 'pending', emilyBook2.body);
  const eId = emilyBook2.body?.id;
  const emilyN = await emily.get('/notifications');
  check('Emily notified of her booking', emilyN.body.notifications.some((x) => x.title === 'New booking assigned'));
  const nurseoncallN = await nurseoncall.get('/notifications');
  check('NurseOnCall notified of roster booking', nurseoncallN.body.notifications.some((x) => x.title === 'New booking on your roster'));
  const emConfirm = await emily.patch(`/bookings/${eId}/status`, { status: 'confirmed' });
  check('Emily confirms her visit', emConfirm.status === 200, emConfirm.body);

  console.log('\n[D] Admin overview & authorization scoping');
  const stats = await admin.get('/admin/stats');
  check('admin stats endpoint responds', stats.status === 200 && typeof stats.body.totalBookings === 'number', stats.body);
  const sarahFeed = await sarah.get('/bookings');
  check('caregiver feed only shows assigned visits', sarahFeed.body.every((b) => String(b.caregiverId) === '1'));
  const nehaFeed = await neha.get('/bookings');
  check('patient feed only shows own bookings', nehaFeed.body.every((b) => b.userId === '6' && b.userName === 'Neha Gupta'));
  const wrongRole = await john.get('/admin/stats');
  check('patient blocked from admin API (403)', wrongRole.status === 403, wrongRole.body);

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('smoke test crashed:', err);
  process.exit(1);
});
