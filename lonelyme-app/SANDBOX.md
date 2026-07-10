# LonelyMe Development Sandbox

Full local development environment with **Supabase**, **mock Stripe**, and **mock translation** — no paid APIs required.

## Quick Start (3 commands)

```bash
cd lonelyme-app
npm install
npm run sandbox:setup    # copies env, optionally starts Supabase
npm run dev
```

Open http://localhost:3000 — you'll see an amber **Sandbox Mode** banner.

## What's Included

| Component | Sandbox behavior |
|---|---|
| **Supabase** | Local via Docker, or cloud test project |
| **Auth** | Magic links → view in [Inbucket](http://127.0.0.1:54324) (local) |
| **Stripe** | `mock` mode — instant token credit, no payment |
| **Translation** | `mock` — prefixes `[Spanish] your message` |
| **Moderation** | Keyword filter — flags scam/romance keywords |
| **Seed users** | Maria, Kenji, Amara, Lucas for matching |

## Option A: Supabase Local (recommended)

**Requirements:** Docker Desktop

```bash
npm run sandbox:start     # supabase start + db reset with seed data
npm run dev
```

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| Supabase Studio | http://127.0.0.1:54323 |
| Inbucket (emails) | http://127.0.0.1:54324 |
| API | http://127.0.0.1:54321 |

### Magic link flow
1. Go to `/signup`, enter any email (e.g. `you@test.com`)
2. Open Inbucket → click the magic link
3. Complete onboarding → match with seed users

### Test users (pre-seeded)
| Email | Languages | Interests |
|---|---|---|
| maria@lonelyme.test | Spanish, English | Travel, Music, Cooking |
| kenji@lonelyme.test | Japanese, English | Gaming, Technology |
| amara@lonelyme.test | English, French | Books, Photography |
| lucas@lonelyme.test | Portuguese, English, Spanish | Sports, Music |

## Option B: Supabase Cloud Test Project

No Docker needed:

```bash
cp env.cloud-test.local .env.local
# Fill in Supabase keys from supabase.com dashboard
# Run supabase/schema.sql + supabase/seed.sql in SQL Editor
npm run dev
```

Disable email confirmation in Supabase Auth settings for easier testing.

## Stripe Modes

### Mock (default in sandbox)
```env
STRIPE_MODE=mock
NEXT_PUBLIC_STRIPE_MODE=mock
```
Token packs credit instantly — no Stripe account needed.

### Test (real Stripe test checkout)
```bash
stripe login
npm run sandbox:stripe    # creates test products, prints price IDs
```

Add to `.env.local`:
```env
STRIPE_MODE=test
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER_5=price_...
STRIPE_PRICE_STARTER_10=price_...
```

Forward webhooks:
```bash
npm run sandbox:stripe:listen
```

Use test card: `4242 4242 4242 4242`

## Translation Modes

```env
TRANSLATION_PROVIDER=mock     # default — [Language] prefix
TRANSLATION_PROVIDER=gemini   # + GEMINI_API_KEY
TRANSLATION_PROVIDER=deepl    # + DEEPL_API_KEY
```

Mock recognizes a few phrases: "hello" → "Hola" (Spanish), etc.

## npm Scripts

| Script | Description |
|---|---|
| `npm run sandbox:setup` | Copy env + optional Supabase start |
| `npm run sandbox:start` | `supabase start` + `db reset` |
| `npm run sandbox:stop` | Stop local Supabase |
| `npm run sandbox:stripe` | Create Stripe test products |
| `npm run sandbox:stripe:listen` | Forward Stripe webhooks |
| `npm run dev` | Start Next.js |

## File Reference

```
env.sandbox.local      → Local Supabase + mock everything
env.cloud-test.local   → Cloud Supabase + Stripe test keys
supabase/config.toml   → Local Supabase config
supabase/seed.sql      → Test users for matching
supabase/migrations/   → Database schema
scripts/setup-sandbox.sh
scripts/stripe-setup.sh
```

## Troubleshooting

**Magic link not arriving (local):** Check Inbucket at http://127.0.0.1:54324

**No matches found:** Run `npm run sandbox:start` to seed test users, or sign up a second account

**Supabase connection refused:** Run `npm run sandbox:start` or check `NEXT_PUBLIC_SUPABASE_URL`

**Stripe checkout fails:** Use `STRIPE_MODE=mock` or run `npm run sandbox:stripe`
