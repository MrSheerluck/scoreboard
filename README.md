# Scoreboard

A personal effort tracker. Log hours across long-term pursuits — chess, reading, building, whatever you track — and watch a 30-day rolling momentum chart grow or decay based on your consistency.

Each user gets their own isolated data. Self-hostable in under 10 minutes on Cloudflare's free tier.

![Stack](https://img.shields.io/badge/Next.js-15-black) ![Stack](https://img.shields.io/badge/Cloudflare-Workers%20%2B%20D1-orange) ![Stack](https://img.shields.io/badge/Auth-Clerk-purple)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Deployment | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Auth | Clerk (free tier) |
| UI | Tailwind CSS + Recharts |

---

## Self-hosting guide

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- A [Clerk account](https://clerk.com) (free)

---

### 1. Clone and install

```bash
git clone https://github.com/yourname/scoreboard.git
cd scoreboard
npm install
```

---

### 2. Create a Clerk application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → **Create application**
2. Name it anything, enable whichever sign-in methods you want (Google, email, etc.)
3. From **API Keys**, copy:
   - **Publishable key** — starts with `pk_test_`
   - **Secret key** — starts with `sk_test_`

> The free Clerk dev tier is fully functional. It shows a small "Development mode" badge on the sign-in page — this is cosmetic only and has no functional impact.

---

### 3. Configure local environment

Create two files (both are gitignored):

**`.env.local`** — read by Next.js at build time to embed the publishable key:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

**`.dev.vars`** — read by Wrangler at runtime during local dev:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

### 4. Create the Cloudflare D1 database

```bash
npx wrangler d1 create scoreboard
```

Copy the `database_id` from the output and paste it into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "scoreboard"
database_name = "scoreboard"
database_id = "paste-your-id-here"
```

---

### 5. Run locally

```bash
# Apply migrations to the local DB
npm run db:migrate:local

# Build and run via Wrangler (uses .dev.vars for env)
npm run cf:build
npm run cf:dev
```

Open [http://localhost:8787](http://localhost:8787).

---

### 6. Deploy to Cloudflare

```bash
# Apply migrations to the remote DB
npm run db:migrate:remote

# Set your Clerk secret key (never stored in files)
npx wrangler secret put CLERK_SECRET_KEY

# Build with the publishable key embedded, then deploy
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY npm run cf:build
npx wrangler deploy
```

Your app is live at `https://scoreboard.<your-subdomain>.workers.dev`.

> **Windows users:** set the env var differently:
> ```powershell
> $env:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_YOUR_KEY"; npm run cf:build
> ```
> Or put it in `.env.local` and just run `npm run cf:build`.

---

### 7. Allow your domain in Clerk

In **Clerk Dashboard → Domains**, add your `workers.dev` URL so Clerk accepts auth requests from it.

---

## Environment variables reference

| Variable | Where to set | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `.env.local` + build env | Clerk publishable key (embedded at build time) |
| `CLERK_SECRET_KEY` | `.dev.vars` + `wrangler secret put` | Clerk secret key (runtime only, never commit) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `.env.local` + `.dev.vars` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `.env.local` + `.dev.vars` | `/sign-up` |

---

## npm scripts

| Script | Description |
|---|---|
| `npm run cf:build` | Build for Cloudflare (runs `next build` + OpenNext) |
| `npm run cf:dev` | Run locally via Wrangler with D1 bindings |
| `npm run cf:deploy` | Build + deploy in one step |
| `npm run db:migrate:local` | Apply DB migrations to local D1 |
| `npm run db:migrate:remote` | Apply DB migrations to remote D1 |

---

## How it works

- **30-day rolling chart** — each point on the X-axis shows the cumulative hours logged in that category over the preceding 30 days. A category's band grows when you log consistently and decays naturally when you stop, collapsing to zero after 30 days of inactivity.
- **Per-user isolation** — every signed-in user gets their own categories and entries. New users are auto-seeded with 5 default categories (Chess, Game Dev, Reading, Philosophy, Product) which they can extend.
- **No tracking, no analytics** — all data stays in your own Cloudflare D1 database.

---

## License

MIT
