# SEVYO Web App — Technical Knowledge Transfer & Implementation Plan
### Conversion from static GitHub Pages prototype → Next.js + Express + MySQL production app

---

## 1. Overview & Goals

### Current State
`sevyo-web-panels` is a static prototype deployed via GitHub Pages (custom domain `sevyo.co.in`, see `CNAME`):
- 26 hand-written HTML files, one shared `css/styles.css` (custom CSS with design-token CSS variables, no framework), `js/data.js` (hardcoded mock arrays), `js/app.js` (shared UI logic: sidebar rendering via `initPanel(role, activePath)`, notifications, SOS widget, toasts).
- No backend, no database, no build tooling, no `package.json`.
- Auth (`auth.html`) is fake — form submit redirects based on a client-side role selector only. No password hashing, no sessions, no real users.
- Only real persistence is `localStorage` for SOS family contacts. Everything else (bookings, caregivers, vendors, reviews) is static in-memory data — pages render hardcoded arrays, nothing is actually created/updated/deleted.
- Images are hotlinked externally (`media.base44.com`, `images.unsplash.com`) — no local asset pipeline.

### Target State
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express (REST API)
- **Database:** MySQL 8
- Real authentication, real CRUD, real relational data model, deployed on Node-capable hosting.

### Non-Goals (this phase)
- Payment gateway integration (current "online" payment is just a UI radio button with no processor wired up — flagged as an open decision in §9).
- SMS/push notification provider integration.
- Data migration from production data — there is no real production data today (only mock arrays), so no live cutover is needed, only a seed script.

---

## 2. Target Architecture

```
                         ┌─────────────────────────┐
                         │        Browser           │
                         └────────────┬─────────────┘
                                      │ HTTPS
                         ┌────────────▼─────────────┐
                         │   Next.js App (apps/web)  │
                         │  App Router, RSC + client │
                         │  components, Tailwind,    │
                         │  shadcn/ui                │
                         └────────────┬─────────────┘
                                      │ REST (fetch), JWT in httpOnly cookie
                         ┌────────────▼─────────────┐
                         │  Express API (apps/api)   │
                         │  Routes → Controllers →   │
                         │  Services → Prisma ORM    │
                         │  Middleware: helmet, cors,│
                         │  rate-limit, auth guard   │
                         └────────────┬─────────────┘
                                      │ SQL (mysql2 driver via Prisma)
                         ┌────────────▼─────────────┐
                         │        MySQL 8            │
                         └───────────────────────────┘
```

### Proposed Monorepo Layout

```
sevyo-web-panels/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── app/
│   │   │   ├── (public)/          # index, about, auth
│   │   │   ├── (user)/            # user portal routes
│   │   │   ├── (vendor)/          # vendor/agency portal routes
│   │   │   ├── (resource)/        # caregiver/nurse portal routes
│   │   │   └── (admin)/           # admin portal routes
│   │   ├── components/            # shadcn components + custom
│   │   ├── lib/                   # api client, auth helpers, utils
│   │   └── tailwind.config.ts
│   └── api/               # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── middleware/
│       │   └── prisma/
│       │       ├── schema.prisma
│       │       └── seed.ts
│       └── server.ts
├── packages/
│   └── shared-types/      # TS types/interfaces shared between web & api
└── SEVYO_WEBAPP_DOC.md
```

### Auth Flow
- Passwords hashed with **bcrypt** (cost factor 12).
- On login: issue a short-lived **JWT access token** (15 min) + a longer-lived **refresh token** (7 days), both set as `httpOnly`, `Secure`, `SameSite=Strict` cookies — avoids XSS token theft, avoids needing client-side token storage.
- Refresh tokens stored in DB (`refresh_tokens` table) so they can be revoked (logout, password change).
- Express middleware `requireAuth` verifies access token; `requireRole(...roles)` gates role-specific routes (matches the 4 existing portals: user, vendor, resource, admin).

### Secrets / Env Vars
Kept in `.env` files per app (never committed — add to `.gitignore`), see §8 for full reference table.

---

## 3. Tech Stack Decisions

| Concern | Choice | Rationale |
|---|---|---|
| Frontend framework | Next.js 14+ (App Router) | SSR/RSC for dashboards, file-based routing maps cleanly onto the 4 existing portals |
| Language | TypeScript (strict mode) | Type safety across form fields / API contracts |
| Styling | Tailwind CSS | Existing `styles.css` already uses CSS-variable design tokens — port them directly into `tailwind.config.ts` `theme.extend` (colors, spacing, radius) |
| Component library | shadcn/ui | Unstyled, composable, Tailwind-native — replaces custom sidebar/toast/modal/badge code in `app.js` |
| Backend framework | Express 4/5 | Simple, well-understood REST framework, matches requested stack |
| ORM | **Prisma** | Type-safe queries generated from schema, built-in migration system, first-class MySQL support (alternatives considered: Sequelize — more boilerplate, weaker TS support; Drizzle — lighter but less mature migration tooling) |
| Validation | Zod | Shared schemas can validate both API request bodies and (optionally) frontend forms |
| Auth | bcrypt + jsonwebtoken, httpOnly cookies | Industry standard, avoids storing tokens in localStorage (XSS risk) |
| Data fetching (client) | TanStack Query (React Query) | Caching/invalidation for bookings, caregiver lists, etc. |
| File uploads | Local disk (MVP) → S3-compatible bucket (later) | Replaces hotlinked Unsplash/base44 avatar URLs |
| DB | MySQL 8 | Per requirement |

---

## 4. Full MySQL Schema

All tables use `id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`, `created_at`/`updated_at` `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` (`updated_at` also `ON UPDATE CURRENT_TIMESTAMP`), and `utf8mb4` charset.

### 4.1 `users`
Base identity table for all 4 roles (user, vendor-owner, resource/caregiver, admin).

```sql
CREATE TABLE users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(20)  NULL,
  role          ENUM('user','vendor','resource','admin') NOT NULL,
  status        ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  default_address VARCHAR(500) NULL,
  avatar_url    VARCHAR(500) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.2 `vendors` (nursing agencies)
1:1 with a `users` row where `role = 'vendor'`.

```sql
CREATE TABLE vendors (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  agency_name   VARCHAR(200) NOT NULL,
  logo_url      VARCHAR(500) NULL,
  location      VARCHAR(255) NULL,
  contact_email VARCHAR(255) NULL,
  contact_phone VARCHAR(20) NULL,
  status        ENUM('active','pending','suspended') NOT NULL DEFAULT 'pending',
  rating        DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  revenue_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  member_since  DATE NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vendors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_vendors_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.3 `services` (lookup table)
Replaces hardcoded `INSTANT_SERVICES` / `LANDING_SERVICES` arrays in `data.js`.

```sql
CREATE TABLE services (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  category    ENUM('instant','scheduled','care') NOT NULL DEFAULT 'scheduled',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_services_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
Seed rows: IV Cannulation, IM/SC Injection, Major Dressing, Minor Wound Dressing, Electrolyte IV, etc.

### 4.4 `specializations` (lookup table)
Replaces free-text comma-separated `cgSpecs` field.

```sql
CREATE TABLE specializations (
  id    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_spec_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.5 `caregivers`
1:1 with a `users` row where `role = 'resource'`; optionally linked to a `vendors` row (agency-employed) or NULL (independent).

```sql
CREATE TABLE caregivers (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT UNSIGNED NOT NULL,
  vendor_id         BIGINT UNSIGNED NULL,
  type              ENUM('nurse','caregiver','physiotherapist','lab','mental_health','elder_care','pediatric') NOT NULL,
  price_per_hour    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  bio               TEXT NULL,
  experience_years  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  rating            DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  reviews_count     INT UNSIGNED NOT NULL DEFAULT 0,
  available         BOOLEAN NOT NULL DEFAULT TRUE,
  verified          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_caregivers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_caregivers_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
  UNIQUE KEY uq_caregivers_user (user_id),
  KEY idx_caregivers_type (type),
  KEY idx_caregivers_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.6 `caregiver_specializations` (join table, many-to-many)

```sql
CREATE TABLE caregiver_specializations (
  caregiver_id      BIGINT UNSIGNED NOT NULL,
  specialization_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (caregiver_id, specialization_id),
  CONSTRAINT fk_cs_caregiver FOREIGN KEY (caregiver_id) REFERENCES caregivers(id) ON DELETE CASCADE,
  CONSTRAINT fk_cs_spec FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.7 `bookings`

```sql
CREATE TABLE bookings (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          BIGINT UNSIGNED NOT NULL,
  caregiver_id     BIGINT UNSIGNED NULL,
  vendor_id        BIGINT UNSIGNED NULL,
  service_id       BIGINT UNSIGNED NOT NULL,
  scheduled_date   DATE NOT NULL,
  scheduled_time   TIME NOT NULL,
  duration_hours   DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  visit_location   ENUM('home','site') NOT NULL DEFAULT 'home',
  address          VARCHAR(500) NULL,
  status           ENUM('pending','broadcast','confirmed','in_progress','completed','cancelled','expired') NOT NULL DEFAULT 'pending',
  payment_method   ENUM('cash','online') NOT NULL DEFAULT 'cash',
  payment_status   ENUM('unpaid','pending','paid') NOT NULL DEFAULT 'unpaid',
  price            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes            TEXT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_caregiver FOREIGN KEY (caregiver_id) REFERENCES caregivers(id) ON DELETE SET NULL,
  CONSTRAINT fk_bookings_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
  CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services(id),
  KEY idx_bookings_status (status),
  KEY idx_bookings_user (user_id),
  KEY idx_bookings_caregiver (caregiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.8 `reviews`

```sql
CREATE TABLE reviews (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id   BIGINT UNSIGNED NOT NULL,
  user_id      BIGINT UNSIGNED NOT NULL,
  caregiver_id BIGINT UNSIGNED NULL,
  vendor_id    BIGINT UNSIGNED NULL,
  rating       TINYINT UNSIGNED NOT NULL,
  comment      TEXT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_caregiver FOREIGN KEY (caregiver_id) REFERENCES caregivers(id) ON DELETE SET NULL,
  CONSTRAINT fk_reviews_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
  UNIQUE KEY uq_reviews_booking (booking_id),
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.9 `family_contacts` (SOS)
Replaces `localStorage` key `sevyo_family_contacts`.

```sql
CREATE TABLE family_contacts (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  name       VARCHAR(150) NOT NULL,
  phone      VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_family_contacts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_family_contacts_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.10 `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  revoked     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_refresh_tokens_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.11 Entity-Relationship Summary
- `users` 1—1 `vendors` (role=vendor)
- `users` 1—1 `caregivers` (role=resource)
- `vendors` 1—N `caregivers` (agency roster)
- `caregivers` N—M `specializations` via `caregiver_specializations`
- `users` 1—N `bookings` (as the customer)
- `caregivers` 1—N `bookings`, `vendors` 1—N `bookings`, `services` 1—N `bookings`
- `bookings` 1—1 `reviews`
- `users` 1—N `family_contacts`
- `users` 1—N `refresh_tokens`

---

## 5. Express API Design

Base path: `/api`. All protected routes require `Authorization` via httpOnly cookie; role gate noted per route.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | public | Create user (any role), hash password |
| POST | `/auth/login` | public | Verify credentials, issue access+refresh cookies |
| POST | `/auth/refresh` | cookie | Rotate access token from refresh token |
| POST | `/auth/logout` | authenticated | Revoke refresh token, clear cookies |
| GET | `/users/me` | authenticated | Current user profile |
| PATCH | `/users/me` | authenticated | Update profile (name, phone, address, avatar) |
| GET | `/admin/users` | admin | List/filter all users |
| PATCH | `/admin/users/:id/status` | admin | Activate/suspend user |
| GET | `/vendors` | public | List vendors (filters: status, location) |
| GET | `/vendors/:id` | public | Vendor detail |
| POST | `/vendors` | authenticated (vendor) | Create/complete vendor profile |
| PATCH | `/vendors/:id` | vendor (own) / admin | Update vendor profile |
| GET | `/caregivers` | public | Search/browse caregivers (filters: type, price range, specialization, available, vendor_id — powers `user-browse.html`) |
| GET | `/caregivers/:id` | public | Caregiver detail |
| POST | `/caregivers` | vendor / resource | Create caregiver profile |
| PATCH | `/caregivers/:id` | resource (own) / vendor (own roster) / admin | Update profile, price, availability, specializations |
| GET | `/services` | public | List active services |
| POST | `/bookings` | user | Create booking (instant or scheduled — matches `user-home.html` and `user-booking.html`) |
| GET | `/bookings` | authenticated | List bookings scoped to caller's role (user: own; vendor: agency's; resource: assigned; admin: all) |
| GET | `/bookings/:id` | authenticated (participant/admin) | Booking detail |
| PATCH | `/bookings/:id/status` | vendor/resource/admin | Update booking status (confirm, start, complete, cancel) |
| POST | `/reviews` | user | Submit review for a completed booking |
| GET | `/reviews` | public | List reviews (filters: caregiver_id, vendor_id) |
| GET | `/family-contacts` | user | List own SOS contacts |
| POST | `/family-contacts` | user | Add SOS contact |
| DELETE | `/family-contacts/:id` | user (own) | Remove SOS contact |
| GET | `/admin/stats` | admin | Aggregate dashboard stats (replaces `ADMIN_STATS`, `REVENUE_DATA`, `BOOKINGS_BY_TYPE`) |

Middleware stack (applied in `apps/api/src/server.ts`): `helmet()`, `cors({ origin: WEB_ORIGIN, credentials: true })`, `express.json()`, cookie parser, global rate limiter, per-route `requireAuth`/`requireRole`, centralized error-handling middleware returning `{ error: { message, code } }`.

---

## 6. Frontend Page Map (existing HTML → Next.js route)

| Existing file | New route | Rendering | Key shadcn components |
|---|---|---|---|
| `index.html` | `app/(public)/page.tsx` | Server | Card, Accordion (FAQ), Button |
| `about.html` | `app/(public)/about/page.tsx` | Server | — |
| `auth.html` | `app/(public)/auth/page.tsx` | Client (form) | Tabs (sign in/up), Form, Input, RadioGroup (role) |
| `user-home.html` | `app/(user)/home/page.tsx` | Client (instant booking form) | Select, Input, Dialog |
| `user-browse.html` | `app/(user)/browse/page.tsx` | Client (filters) + Server (initial data) | Input (search), Select, Card |
| `user-caregiver-detail.html` | `app/(user)/caregivers/[id]/page.tsx` | Server | Card, Badge, Avatar |
| `user-booking.html` | `app/(user)/booking/[caregiverId]/page.tsx` | Client (checkout form) | Form, RadioGroup, Textarea |
| `user-bookings.html` | `app/(user)/bookings/page.tsx` | Server | Table, Badge |
| `user-profile.html` | `app/(user)/profile/page.tsx` | Client | Form, Input |
| `vendor-dashboard.html` | `app/(vendor)/dashboard/page.tsx` | Server | Card, Chart (stats) |
| `vendor-caregivers.html` | `app/(vendor)/caregivers/page.tsx` | Client (add/edit form) | Table, Dialog, Form |
| `vendor-bookings.html` | `app/(vendor)/bookings/page.tsx` | Server | Table |
| `vendor-finance.html` | `app/(vendor)/finance/page.tsx` | Server | Card, Table |
| `resource-dashboard.html` | `app/(resource)/dashboard/page.tsx` | Server | Card |
| `resource-schedule.html` | `app/(resource)/schedule/page.tsx` | Server | Table/Calendar |
| `resource-visit-log.html` | `app/(resource)/visit-log/page.tsx` | Client | Table |
| `resource-profile.html` | `app/(resource)/profile/page.tsx` | Client | Form, Switch (availability) |
| `admin-dashboard.html` | `app/(admin)/dashboard/page.tsx` | Server | Card, Chart |
| `admin-vendors.html` `admin-caregivers.html` `admin-bookings.html` `admin-users.html` `admin-reviews.html` | `app/(admin)/{vendors,caregivers,bookings,users,reviews}/page.tsx` | Server + client actions | Table, Dialog, DropdownMenu |

Shared: `components/sidebar.tsx` (replaces `initPanel`), `components/topbar.tsx`, `components/sos-dialog.tsx` (replaces SOS modal), `components/ui/toaster.tsx` (shadcn `sonner`/`toast` replaces custom toast code in `app.js`).

Sidebar/role-based layout implemented via Next.js **route groups** `(user)`, `(vendor)`, `(resource)`, `(admin)`, each with its own `layout.tsx` that renders the role-appropriate sidebar and enforces auth+role via a server-side check (redirect to `/auth` if unauthenticated/wrong role).

---

## 7. Migration Plan (Ordered Phases)

1. **Repo restructure & scaffolding** — convert to monorepo (`apps/web`, `apps/api`, `packages/shared-types`); `npx create-next-app` for web with TS+Tailwind; `npm init` + Express + TS setup for api. Move existing static files to a `legacy-static/` reference folder (not deleted, kept for design reference) or archive branch.
2. **Database setup** — install MySQL 8 locally (or via Docker), define `apps/api/prisma/schema.prisma` mirroring §4, run `prisma migrate dev` for initial migration, write `seed.ts` to replace `js/data.js` mock arrays with real seeded rows.
3. **Auth first** — build `/auth/*` endpoints, bcrypt hashing, JWT issuance, `requireAuth`/`requireRole` middleware, and the Next.js `/auth` page wired to real API calls. Everything downstream depends on working auth.
4. **Core CRUD APIs** — implement remaining endpoints in §5 per resource (users, vendors, caregivers, services, bookings, reviews, family-contacts, admin stats), each with Zod request validation and Prisma queries.
5. **Frontend pages** — build out routes per §6 in order: public → auth → user portal → vendor portal → resource portal → admin portal. Port design tokens from `css/styles.css` CSS variables into `tailwind.config.ts` theme so visual identity is preserved.
6. **Component wiring** — install/configure shadcn/ui, replace custom sidebar/toast/notification/SOS logic from `app.js` with React components + TanStack Query for data fetching/caching/invalidation.
7. **File uploads** — implement avatar/logo upload endpoint (multer + local disk for MVP), replace hotlinked Unsplash/base44 URLs with real uploaded/served assets.
8. **Testing** — Vitest/Jest unit tests for API services (especially booking status transitions, auth), integration tests for critical flows (register→login→book→review).
9. **Deployment** — move off GitHub Pages (static-only, cannot run Node): deploy `apps/web` to Vercel, `apps/api` + MySQL to Railway/Render/a VPS with PM2 + Nginx reverse proxy; repoint `sevyo.co.in` DNS/CNAME accordingly; configure production env vars (§8) and HTTPS.
10. **Seed/cutover** — no live production data exists (current app has no real users), so cutover is simply running the seed script against production MySQL before go-live; no data migration tooling needed.

---

## 8. Environment Variables Reference

| Variable | App | Purpose |
|---|---|---|
| `DATABASE_URL` | api | MySQL connection string, e.g. `mysql://user:pass@host:3306/sevyo` |
| `JWT_ACCESS_SECRET` | api | Signing secret for access tokens |
| `JWT_REFRESH_SECRET` | api | Signing secret for refresh tokens |
| `ACCESS_TOKEN_TTL` | api | e.g. `15m` |
| `REFRESH_TOKEN_TTL` | api | e.g. `7d` |
| `PORT` | api | Express listen port |
| `NODE_ENV` | api, web | `development` / `production` |
| `CORS_ORIGIN` | api | Allowed frontend origin(s) |
| `UPLOAD_DIR` | api | Local disk path for MVP file uploads |
| `NEXT_PUBLIC_API_BASE_URL` | web | Public API base URL for client fetches |
| `COOKIE_DOMAIN` | api | Cookie domain scope (e.g. `.sevyo.co.in`) |

---

## 9. Open Decisions / Assumptions (flagged for follow-up)

- **Payment processing**: current UI only has a `cash`/`online` radio button with no processor. A gateway (Razorpay/Stripe) must be chosen before `payment_status` can move beyond `pending`/`unpaid` meaningfully.
- **SMS/notifications**: no provider currently integrated for booking confirmations/SOS alerts — needs selection (e.g., Twilio, MSG91).
- **Independent vs agency-employed caregivers**: schema allows `caregivers.vendor_id` to be NULL for independents — confirm this matches intended business rules.
- **Admin-created vendors/caregivers vs self-signup**: current mock data implies admin-managed onboarding; confirm whether vendors/caregivers self-register (`/auth/register` with role) or are admin-provisioned only.
- **Hosting choice** (Vercel+Railway vs single VPS) left open pending budget/ops preference — both are compatible with the architecture in §2.
