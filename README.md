# FlowAsistan

The CRM panel for chatbots and voice agents. FlowAsistan collects the conversations your
WhatsApp, Instagram, Telegram and web chatbots and your voice agent have with customers,
shows each one with an AI summary and an outcome category, and surfaces the ones that need
a person.

Chatbot ve sesli asistan görüşmeleri için CRM paneli. Arayüz Türkçe ve İngilizce.

## What is in the panel

| Page | What it does |
|---|---|
| Overview | KPIs, live feed of the latest conversations, 7-day volume, queue of customers waiting for a callback |
| Chatbot | Inbox grouped by customer with message history and AI summary; analytics per channel |
| Voice Agent | Call log with summary, transcript and recording; call analytics |
| Customers | Customer list, search, new customer, interaction history across chat and calls |
| Calendar | Appointments booked by the bots and the team; create and cancel |
| Reports | Channel, category and daily breakdowns for 7 / 14 / 30 days; CSV export |
| Notifications | Urgent, success, warning and system notifications; mark read, delete |
| Settings | Language, conversation categories, platform connections |

## Stack

React 19, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion, Supabase (Postgres, Auth,
Realtime). Records are written to Supabase by n8n flows (chatbot and voice agent webhooks);
the panel reads and updates them.

## Two modes

**Demo mode** runs the whole panel in the browser on fictional data (`src/lib/demo`): no login,
no Supabase, no external API. It is what the public site serves. The panel lives under `/demo`.

**Live mode** uses Supabase with email and password login. The panel lives under `/app`.

The mode is decided at build time in `src/lib/config.ts`:

- `VITE_DEMO_MODE=true`, or missing Supabase variables: demo mode
- Supabase variables set and `VITE_DEMO_MODE` not `true`: live mode

`.env.production` sets `VITE_DEMO_MODE=true`, so every production build is a demo unless the
hosting environment overrides it.

## Run locally

```bash
npm install
cp .env.example .env    # fill in the Supabase values for live mode, or leave them out for demo
npm run dev             # http://localhost:3005
```

To see the demo locally while a `.env` with Supabase values exists:

```bash
VITE_DEMO_MODE=true npm run dev
```

## Deploy (Vercel)

Import the repository in Vercel. `vercel.json` already sets the build command, the output
directory and the single-page-app rewrite. Do not add the Supabase variables to the Vercel
project: the public deployment is meant to be the demo.

### Before serving live mode publicly

The policies in `supabase/schema.sql` are development policies (`USING (true)`): anyone holding
the anon key can read, change and delete every row. The anon key is embedded in the client
bundle, so a public live-mode deployment would expose customer data. Restrict the policies to
signed-in users (and to the owning business) first.

## Database

`supabase/schema.sql` creates the tables, the `urgent_callbacks` view and the seed categories.
