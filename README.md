# Sevyo — Home Healthcare Marketplace

Production implementation of `SEVYO_WEBAPP_DOC.md`: Next.js 14 (App Router) frontend,
Express + Prisma API, MySQL 8.

```
├── apps/
│   ├── api/              Express REST API (port 4000) — Prisma, JWT cookies, Zod, Vitest
│   └── web/              Next.js 14 app (port 3000) — Tailwind, TanStack Query, shadcn-style UI
├── packages/
│   └── shared-types/     Shared DTOs/enums (consumed via built dist/)
├── legacy-static/        Original HTML prototype (reference only)
└── docker-compose.yml    MySQL 8.0 (db: sevyo, user: sevyo / sevyo_pass)
```

## Quick start

Prereqs: Node 20+, Docker (for MySQL).

```bash
# 1. Database
docker compose up -d mysql

# 2. API
npm install --no-audit --no-fund --prefix apps/api
cp apps/api/.env.example apps/api/.env        # DATABASE_URL matches compose creds
npm run db:migrate --prefix apps/api          # prisma migrate dev
npm run db:seed --prefix apps/api             # demo data

# 3. Web
npm install --no-audit --no-fund --prefix apps/web
cp apps/web/.env.example apps/web/.env.local

# 4. Run (two terminals)
npm run dev --prefix apps/api                 # http://localhost:4000/api
npm run dev --prefix apps/web                 # http://localhost:3000
```

### Demo logins (password for all: `sevyo123`)

| Role | Email |
|---|---|
| Patient/user | `john@example.com` |
| Admin | `admin@sevyo.co.in` |
| Vendor agency | any vendor user from seed (see `apps/api/prisma/seed.ts`) |
| Caregiver/resource | `sarah@sevyo.co.in` |

## Scripts

Root (use `--prefix`):

```bash
npm run dev      --prefix apps/api    # tsx watch server
npm run build    --prefix apps/api    # tsc → dist
npm run start    --prefix apps/api
npm run test     --prefix apps/api    # vitest (booking state machine, password, jwt)

npm run dev      --prefix apps/web
npm run build    --prefix apps/web
npm run start    --prefix apps/web
npm run typecheck--prefix apps/web

npm run db:migrate --prefix apps/api  # prisma migrate dev
npm run db:seed    --prefix apps/api
npm run db:studio  --prefix apps/api
```

## Routes

| Portal | Pages |
|---|---|
| Public | `/`, `/about`, `/auth` |
| User | `/user/home`, `/user/browse`, `/user/caregivers/[id]`, `/user/booking/[caregiverId]`, `/user/bookings`, `/user/profile` |
| Vendor | `/vendor/dashboard`, `/vendor/caregivers`, `/vendor/bookings`, `/vendor/finance` |
| Resource (caregiver) | `/resource/dashboard`, `/resource/schedule`, `/resource/visit-log`, `/resource/profile` |
| Admin | `/admin/dashboard`, `/admin/vendors`, `/admin/caregivers`, `/admin/bookings`, `/admin/users`, `/admin/reviews` |

Auth is httpOnly-cookie based (`access_token` 15m + rotating `refresh_token` 7d).
Server components gate portals via `requirePortal(role)` (`apps/web/src/lib/auth.ts`);
wrong role redirects to that role's home.

## ⚠️ Running on an exFAT drive (D:\)

This workspace lives on exFAT, which does not support symlinks:

- **No npm workspaces.** Each app has its own `node_modules`; cross-package deps use
  `"file:..."` + `install-links=true` (see per-app `.npmrc`). Root scripts use `--prefix`.
- **`next` build/dev crash** with `EISDIR ... readlink` because the exFAT driver returns
  bogus errors for speculative readlink calls. Fixed by `apps/web/exfat-readlink-fix.cjs`
  (normalizes EISDIR→EINVAL), wired into web's `dev/build/start` scripts and
  `next.config.mjs` (`resolve.symlinks=false`, `cache=false`).
- **Corrupted dirs:** three directory entries were corrupted by force-killed processes and
  are OS-locked (EPERM): `apps/web/lib/`, `apps/web/components/ui/`,
  `packages/shared-types/src/`. Their content was rebuilt under `apps/web/src/{lib,components}`
  and as hand-regenerated `packages/shared-types/dist/`. The locked dirs are dead weight —
  do not touch them. Running elevated `chkdsk D: /f` can reclaim them; afterwards the
  duplicates under `src/` can be merged back if desired.
- Because of the locked `packages/shared-types/src/`, **re-running `npm install` in
  `apps/web` will fail** (the `file:` dep tries to copy that dir). Dependencies are already
  installed; after chkdsk restores `src/`, installs work normally again.
- On NTFS drives none of the above workarounds are needed; remove the `-r ./exfat-readlink-fix.cjs`
  from web scripts and restore normal config if you migrate the repo.

## Deployment notes (doc §9)

- Build API (`tsc`) and run `node dist/server.js` behind TLS; set strong
  `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`, `CORS_ORIGIN` of the web origin.
- Web: `next build` + `next start` (or Vercel); set `NEXT_PUBLIC_API_BASE_URL`.
- Serve `/uploads` from persistent storage (or move to S3-compatible storage).
- Run migrations with `prisma migrate deploy` in release pipeline; never `migrate dev`.
