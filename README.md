# Voxline — Call Command

A lightweight, local call & lead tracker for solo sales. Inspired by the
[Voxline Sales Command](https://chrome-call-flow.lovable.app/) dashboard design, scoped down to
one person: real leads, real call logging, a real dashboard — no fake team stats, no telephony
integration required.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- SQLite via Prisma ORM — a single `prisma/dev.db` file, no server to host
- Recharts for the dashboard charts

## Getting started

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npm run db:seed          # optional: loads sample leads to try it out
npm run dev
```

Then open http://localhost:3000.

## What's here

- **Dashboard** — live stats computed from your own data: calls today/this week, connection
  rate, a 14-day calls chart, outcome breakdown, and a lead-to-close funnel.
- **Leads** — a searchable/filterable table. Add, edit, delete, import a CSV, export a CSV.
- **Calling** — a manual call queue (overdue follow-ups first, then never-called leads). Pick up
  the phone yourself, click an outcome, jot notes and a next follow-up date, and it logs the call
  and moves to the next lead. `tel:` links use whatever calling app is registered on your machine.
- **Settings** — your name, company, and daily call target (drives the sidebar progress bar).

## Data

Everything lives in `prisma/dev.db` (SQLite), ignored by git. Back up or move your data with the
**Export** button on the Leads page, which downloads a CSV of every lead.
