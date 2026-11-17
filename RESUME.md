# Sevyo — Project Status

> Status as of the latest session. Supersedes the earlier "build handoff" version.

## ✅ Done — full stack builds clean

| Check | Result |
|---|---|
| `npx tsc --noEmit` in `apps/api` | 0 errors |
| `npx vitest run` in `apps/api` | 12/12 passing |
| `npx tsc --noEmit` in `apps/web` | 0 errors |
| `npm run build` in `apps/web` | 24 routes compiled |

- **API** (`apps/api`): Express + Prisma + MySQL — auth with rotating refresh cookies,
  users/vendors/caregivers/services/bookings/reviews/family-contacts/admin endpoints,
  booking state machine (`TRANSITIONS` in `src/services/booking.service.ts`), multer
  uploads, Zod validation, rate limiting. Fully reconstructed after data loss; verified
  against the intact Prisma schema + seed + web client contracts.
- **Web** (`apps/web`): standard `src/` layout — `src/app/` (24 routes across public +
  user/vendor/resource/admin portals), `src/components/` (shared + 19 shadcn-style UI
  primitives), `src/lib/` (api-client, auth gate, format helpers). Path alias `@/* → ./src/*`.
- **shared-types**: dist regenerated with string ids everywhere; synced into both apps'
  node_modules copies.
- **README.md** at repo root: setup, demo logins, scripts, deployment notes.

## ⚠️ exFAT drive caveats (D:\)

- Three directory entries were OS-corrupted and locked (EPERM): `apps/web/lib/`,
  `apps/web/components/ui/`, `packages/shared-types/src/`. `shared-types/src/` and `dist/`
  have since been rebuilt and committed (`npm run build --prefix packages/shared-types`);
  `dist/` is committed on purpose — the `file:` dependency consumes it directly.
  The two `apps/web` duplicates still live under `apps/web/src/{lib,components}`.
- Elevated `chkdsk D: /f` would reclaim them; afterwards the duplicates under
  `apps/web/src/{lib,components}` could be merged back (optional).
- exFAT also breaks webpack's speculative `readlink` calls (`EISDIR`). Fixed by
  `apps/web/exfat-readlink-fix.cjs` wired into web dev/build/start scripts +
  `next.config.mjs` (`resolve.symlinks=false`, `cache=false`). On NTFS none of this is needed.
- The API suffered the same corruption later (empty-but-open dirs under
  `apps/api/src/*` + `tests/`); all ~49 files were rebuilt from contract sources
  (schema.prisma, seed.ts, app/server entrypoints, shared-types d.ts, web client).

## ▶️ To run end-to-end

Option A — no Docker (ephemeral in-memory MySQL 8; data is discarded on stop):

```bash
npm run db:local                               # starts MySQL, writes DATABASE_URL to apps/api/.env
npm run db:deploy --prefix apps/api            # apply migrations
npm run db:seed   --prefix apps/api            # demo data
npm run dev --prefix apps/api                  # :4000
npm run dev --prefix apps/web                  # :3000
```

Option B — Docker:

```bash
docker compose up -d mysql
cp apps/api/.env.example apps/api/.env
npm run db:deploy --prefix apps/api
npm run db:seed   --prefix apps/api
npm run dev --prefix apps/api                  # :4000
npm run dev --prefix apps/web                  # :3000
```

Demo logins (password `sevyo123`): `john@example.com` (user),
`admin@sevyo.co.in` (admin), `sarah@sevyo.co.in` (resource); vendor accounts in
`apps/api/prisma/seed.ts`.

## Remaining (optional / future work)

1. Click-through portals done via API smoke tests (login, services, booking, payment
   order/verify incl. signature tampering — all green, 14/14 unit tests). Web pages render
   with the new floaters/404/error states. Remaining: real Razorpay credentials (current
   test keys are rejected by Razorpay with "Authentication failed") and portal click-through.
2. Payment is integrated via Razorpay (test keys supported): booking with
   paymentMethod=online opens Razorpay checkout; `POST /api/payments/razorpay/order`
   creates/reuses the order (stored on `bookings.razorpay_order_id`) and
   `POST /api/payments/razorpay/verify` checks the signature and marks the booking paid.
   A "Pay now" button appears for unpaid online bookings on /user/bookings.
   Remaining: booking `expired` transitions (cron) and going live with real keys.
3. After chkdsk reclaims the corrupt entries: optionally merge `apps/web/src/{lib,components/ui}`
   back to their original paths, restore `packages/shared-types/src/index.ts`, and drop the
   exfat shim from web scripts if moving to NTFS.
