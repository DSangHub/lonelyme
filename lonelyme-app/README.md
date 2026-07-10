# LonelyMe App

Core LonelyMe features built with **Next.js 16** + **Supabase** + **Stripe**.

## Features

- **User auth** — Email/password signup & login via Supabase Auth (50 free starter tokens)
- **Token balance** — Track balance and transactions in Supabase
- **Stripe checkout** — $5 and $10 token packs
- **Matching** — Find a random available global friend (10 tokens per match)
- **Text chat** — Real-time messages via Supabase Realtime + translation (Gemini / DeepL / mock)
- **AI moderation** — Safety filter on every message (Gemini or keyword fallback)
- **Video chat stub** — WebRTC local camera/mic with signaling placeholder

## Setup

### 1. Install dependencies

```bash
cd lonelyme-app
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Copy your project URL and keys to `.env.local`

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_STARTER_5` | Stripe Price ID for $5 pack |
| `STRIPE_PRICE_STARTER_10` | Stripe Price ID for $10 pack |
| `GEMINI_API_KEY` | Optional — for translation & moderation |
| `DEEPL_API_KEY` | Optional — alternative translation provider |
| `NEXT_PUBLIC_APP_URL` | e.g. `http://localhost:3000` |

### 4. Stripe webhook (local dev)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/signup`, `/login` | Auth |
| `/dashboard` | User home |
| `/match` | Find a global friend |
| `/chat/[id]` | Text chat with translation |
| `/video/[id]` | WebRTC video stub |
| `/tokens` | Buy token packs |

## API Routes

- `POST /api/match` — Find/create a match
- `GET/POST /api/messages` — Chat messages
- `POST /api/translate` — Translate text
- `POST /api/moderate` — Moderate content
- `POST /api/stripe/checkout` — Create Stripe session
- `POST /api/stripe/webhook` — Handle payments

## Database

See `supabase/schema.sql` for tables: `profiles`, `token_balances`, `token_transactions`, `matches`, `conversations`, `messages`.

## Notes

- Translation falls back to `[Language] original text` mock if no API key is set
- Moderation falls back to keyword filter if Gemini is unavailable
- Video chat initializes local WebRTC; full P2P needs a signaling server (Supabase Realtime recommended)
