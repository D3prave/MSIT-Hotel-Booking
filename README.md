# DENKRAUM 1886

Hotel booking platform for a bleisure-focused property.

This project was developed as part of **Management Simulation in Tourism 2026**.

Built with Next.js + Supabase, with bilingual UI (EN/DE), room and service reservations, waitlist flow, feedback capture, and admin occupancy analytics.

Live website: [denkraum1886.vercel.app](https://denkraum1886.vercel.app)

## What This Project Includes

- Marketing website with sections:
  - About
  - Experience
  - Rooms
  - Services
  - Guest Feedback
  - Contact
- Room booking flow:
  - Date-based booking
  - Per-category availability window (7 days)
  - Pending/confirmed/cancel lifecycle
  - Waitlist option when sold out
- Service booking flow:
  - Multiple services with pricing models
  - Date + start-time selection
  - Slot capacity checks
  - Pending/confirmed/cancel lifecycle
- My Stays dashboard:
  - Room bookings
  - Service bookings
  - Waitlist entries
- Admin dashboard:
  - Occupancy today
  - Average occupancy (7 days)
  - Projected 7-day revenue
  - 7-day category calendar
- Email notifications:
  - Booking created/confirmed/cancelled
  - Service booking created/confirmed/cancelled

## Tech Stack

- `Next.js 16` (App Router)
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `Supabase` (Auth + Postgres + RLS)
- `Nodemailer` (SMTP)
- `Vercel Analytics` + `Vercel Speed Insights`

## Repository Structure

```text
.
├── supabase/
│   ├── config.toml
│   └── snippets/                 # SQL scripts for schema, policies, seed data
└── web/
    ├── app/                      # Next.js routes/pages
    ├── components/               # UI + booking forms
    ├── lib/                      # i18n, Supabase clients, notifications
    ├── public/                   # images/assets
    └── .env.example              # environment template
```

## Local Setup

### 1) Install dependencies

```bash
cd web
npm ci
```

### 2) Configure environment

```bash
cp .env.example .env.local
```

Fill values in `web/.env.local`.

### 3) Prepare Supabase database

Run SQL scripts from [`supabase/snippets/README.md`](supabase/snippets/README.md) in the listed order.

Minimum for full current functionality:

1. `01_booking_hardening.sql`
2. `02_rls_policies.sql`
3. `03_rooms_i18n.sql`
4. `04_verification.sql`
5. `08_service_bookings.sql`
6. `09_guest_feedback.sql`
7. `10_conversion_waitlist_and_service_slots.sql`

Optional occupancy baseline script:

- `11_reseed_70pct_until_year_end_preserve_real.sql`

Important: SQL snippets use `admin@example.com` as a placeholder where admin email checks are needed.
Replace that with your actual admin user email before running those scripts in production.

### 4) Run app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Set these in `web/.env.local` (local) and in Vercel (production):

### Required

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Required for admin access

- `ADMIN_EMAILS`
  - Comma-separated list of admin emails.
  - Example: `admin1@example.com,admin2@example.com`

### Email notifications (recommended: Gmail SMTP, no custom domain needed)

- `SMTP_HOST` (default in code: `smtp.gmail.com`)
- `SMTP_PORT` (default in code: `465`)
- `SMTP_SECURE` (default in code: `true`)
- `SMTP_USER`
- `SMTP_PASS` (Gmail App Password)
- `EMAIL_FROM` (e.g. `DENKRAUM 1886 <mailbox@gmail.com>`)

Optional:

- `EMAIL_TEST_TO` (overrides recipients during testing)

### Optional Resend fallback

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_TEST_TO`

## Deployment (Vercel)

1. Push repo to GitHub.
2. Import project in Vercel.
3. Set root directory to `web`.
4. Add all required environment variables from above.
5. Deploy.

## Public Repo Safety Checklist

This repository is now prepared to be public with these protections:

- `.env*` files are ignored.
- `.vercel/` local link files are ignored.
- `supabase/.temp` and `supabase/.branches` local state are ignored.
- Local junk files (`.DS_Store`) are ignored.
- Supabase local metadata files were removed from git tracking.

Before each public push, run:

```bash
rg -n "(SUPABASE_SERVICE_ROLE_KEY|SMTP_PASS|RESEND_API_KEY|PRIVATE KEY|ghp_|sk_live_)" -S
```

If you suspect secrets were ever committed previously, rotate them and clean git history (for example with `git filter-repo`) before making the repository public.

## Current Behavior Notes

- Waitlist currently stores requests and shows them in **My Stays**.
- Automatic “room became available” waitlist email dispatch is not implemented yet.

## Scripts

From `web/`:

- `npm run dev` - run development server
- `npm run lint` - lint
- `npm run typecheck` - TypeScript check
- `npm run test` - Node test suite
- `npm run build` - production build

## Portfolio Notes

Good talking points for GitHub/portfolio:

- End-to-end booking lifecycle with RLS-backed Supabase access controls
- Dual-language product UX with date/availability logic
- Operational dashboard with occupancy + revenue projections
- Transactional email integration without requiring a custom domain
