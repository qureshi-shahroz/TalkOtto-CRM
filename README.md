# Voxline — Call Command

A lightweight call & lead tracker for solo sales. Inspired by the
[Voxline Sales Command](https://chrome-call-flow.lovable.app/) dashboard design, scoped down to
one person: real leads, real call logging, a real dashboard — no fake team stats, no telephony
integration required.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Postgres via Prisma ORM, hosted free on [Supabase](https://supabase.com) — same database from
  any PC, no per-machine data file to move around
- Recharts for the dashboard charts

## Getting started

1. Create a free project at [supabase.com](https://supabase.com).
2. In your project: **Settings → Database → Connection string**, copy the pooled (port 6543) and
   direct (port 5432) URLs.
3. Copy `.env.example` to `.env` and paste those in as `DATABASE_URL` and `DIRECT_URL`.
4. Run:
   ```bash
   npm install
   npx prisma migrate dev --name init   # creates the tables in Supabase
   npm run db:seed                      # optional: loads sample leads to try it out
   npm run dev
   ```
5. Open http://localhost:3000.

Because the database lives in Supabase rather than a local file, running these same steps on a
second PC (with the same `.env`) gives you the same data — no export/import needed to move
between machines.

## What's here

- **Dashboard** — live stats computed from your own data: calls today/this week, connection
  rate, a 14-day calls chart, outcome breakdown, and a lead-to-close funnel.
- **Leads** — a searchable/filterable table. Add, edit, delete, import a CSV, export a CSV.
- **Calling** — a manual call queue (overdue follow-ups first, then never-called leads). Pick up
  the phone yourself, click an outcome, jot notes and a next follow-up date, and it logs the call
  and moves to the next lead. `tel:` links use whatever calling app is registered on your machine.
- **Settings** — your name, company, and daily call target (drives the sidebar progress bar).

## Data

Lives in Supabase Postgres. You can browse/edit it directly in the Supabase dashboard's Table
Editor, or use **Leads → Export** in the app for a CSV backup.
