# A-Plus Laboratory Dashboard

Patient portal and admin dashboard for A-Plus Laboratory's DNA testing service.

This repo currently implements **Phase 1, Feature 1: Authentication System** —
registration, login, logout, forgot/reset password, and JWT-based session
management. Everything else in the proposal (kit registration, delivery
tracking, results portal, admin dashboard, etc.) is not yet built.

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) primitives (`src/components/ui/`) — see [DESIGN.md](DESIGN.md) for the color palette and component conventions
- **Forms:** React Hook Form + Zod (`@hookform/resolvers`)
- **Database:** PostgreSQL via Prisma
- **Auth:** Custom JWT (via [`jose`](https://github.com/panva/jose), Edge-runtime compatible) + bcrypt password hashing, httpOnly cookies
- **Tests:** Vitest

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill in real values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — a real PostgreSQL connection string (local Postgres,
     or a hosted instance like Neon/Supabase/Railway).
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate strong random
     secrets, e.g. `openssl rand -base64 48`. Never reuse the same secret
     for both.

3. Run migrations to create the database schema:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` — it redirects to `/login`.

## Auth flow

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Create account, sets `access_token` + `refresh_token` cookies |
| `/api/auth/login` | POST | Verify credentials, sets cookies |
| `/api/auth/logout` | POST | Revokes the refresh token, clears cookies |
| `/api/auth/me` | GET | Returns the current user from the access token |
| `/api/auth/refresh` | POST | Rotates the refresh token, issues a new access token |
| `/api/auth/forgot-password` | POST | Issues a one-time reset token (always returns a generic message, no account enumeration) |
| `/api/auth/reset-password` | POST | Consumes the reset token, updates the password, revokes all sessions |

Tokens: a short-lived (15 min) access token and a longer-lived (30 day)
refresh token are both JWTs, delivered as `httpOnly`, `sameSite=lax`
cookies (`secure` in production). Refresh tokens are additionally
hashed and stored server-side so they can be individually revoked
(logout, password reset) and rotated on every use.

`src/middleware.ts` protects `/dashboard/*` and redirects authenticated
users away from `/login` and `/register`.

## Testing

```bash
npm test        # run once
npm run test:watch
```

58 tests cover password hashing, JWT signing/verification, input
validation, and every auth API route (with the Prisma client mocked —
no live database required to run the suite). `npx prisma generate`
must have been run at least once beforehand so `@prisma/client` types
exist.

## Known gaps / next steps

- **Email delivery**: `forgot-password` currently logs the reset token
  to the console in development instead of sending an email. Wire up
  a transactional email provider (Resend, SES, etc.) before shipping.
- **Email verification**: the `emailVerified` field exists on `User`
  but there's no verification flow yet.
- Everything past Phase 1 Feature 1 (kit registration, Chrono24
  integration, results portal, Firebase notifications, admin
  dashboard, CMI payment integration) is not implemented.
