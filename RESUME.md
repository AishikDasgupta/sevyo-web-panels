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

- Three directory entries are OS-corrupted and locked (EPERM): `apps/web/lib/`,
  `apps/web/components/ui/`, `packages/shared-types/src/`. Their content was rebuilt at
  new paths (`apps/web/src/...`) or hand-regenerated (`dist/`). Leave them alone.
- Elevated `chkdsk D: /f` would reclaim them; afterwards the duplicates under
  `apps/web/src/{lib,components}` could be merged back (optional).
- Because of the locked `packages/shared-types/src/`, `npm install` in `apps/web`
  fails (the `file:` dep copies that dir). Deps are already installed; after chkdsk it works again.
- exFAT also breaks webpack's speculative `readlink` calls (`EISDIR`). Fixed by
  `apps/web/exfat-readlink-fix.cjs` wired into web dev/build/start scripts +
  `next.config.mjs` (`resolve.symlinks=false`, `cache=false`). On NTFS none of this is needed.
- The API suffered the same corruption later (empty-but-open dirs under
  `apps/api/src/*` + `tests/`); all ~49 files were rebuilt from contract sources
  (schema.prisma, seed.ts, app/server entrypoints, shared-types d.ts, web client).

## ▶️ To run end-to-end (needs Docker for MySQL)

```bash
docker compose up -d mysql
npm install --no-audit --no-fund --prefix apps/api   # already installed
cp apps/api/.env.example apps/api/.env
npm run db:migrate --prefix apps/api                 # prisma migrate dev
npm run db:seed --prefix apps/api
npm run dev --prefix apps/api                        # :4000
npm run dev --prefix apps/web                        # :3000
```

Demo logins (password `sevyo123`): `john@example.com` (user),
`admin@sevyo.co.in` (admin), `sarah@sevyo.co.in` (resource); vendor accounts in
`apps/api/prisma/seed.ts`.

## Remaining (optional / future work)

1. Smoke-test the running app against real MySQL (migrate → seed → click through all portals).
2. Booking `expired` transitions (cron) and payment gateway integration (doc §7 mentions "coming soon").
3. After chkdsk reclaims the corrupt entries: optionally merge `apps/web/src/{lib,components/ui}`
   back to their original paths, restore `packages/shared-types/src/index.ts`, and drop the
   exfat shim from web scripts if moving to NTFS.
