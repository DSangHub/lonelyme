# LonelyMe App

Core LonelyMe platform — **Next.js** + **Supabase** + **Stripe** (test mode).

Platonic global friendship app with AI matching, real-time translation, safety moderation, and wellness tracking.

## Features

| Feature | Details |
|---|---|
| **Auth** | Email magic link (no passwords) via Supabase OTP |
| **Onboarding** | Languages, interests, timezone for AI matching |
| **Tokens** | $5 / $10 Stripe packs, balance tracking, video minute billing (5 tokens/min) |
| **AI Matching** | Scores friends by language overlap, shared interests, time zone compatibility |
| **Text Chat** | Supabase Realtime + Gemini/DeepL translation |
| **Video Chat** | WebRTC stub + live subtitles (Web Speech API + translation) |
| **Safety** | AI moderation flags scams, romance pressure, inappropriate content |
| **Wellness** | Connection stats, mood check-ins (1–5), mood history chart |

## Quick start

```bash
cd lonelyme-app
npm install
npm run sandbox:setup    # copies sandbox env, optionally starts Supabase local
npm run dev
```

**Full sandbox guide:** [SANDBOX.md](SANDBOX.md)

## Setup (production / cloud)

1. Create a [Supabase](https://supabase.com) project
2. Run `supabase/schema.sql` in the SQL Editor
3. Enable **Email** auth with magic links in Supabase Auth settings
4. Add redirect URL: `http://localhost:3000/api/auth/callback`
5. Create Stripe test products/prices for $5 and $10 packs
6. `stripe listen --forward-to localhost:3000/api/stripe/webhook`

```bash
npm run dev
```

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/signup`, `/login` | Magic link auth |
| `/onboarding` | Profile setup (languages, interests, timezone) |
| `/dashboard` | Home |
| `/match` | AI friend suggestions + connect |
| `/chat/[id]` | Translated text chat |
| `/video/[id]` | Video + live subtitles (5 tokens/min) |
| `/wellness` | Mood check-ins & connection stats |
| `/tokens` | Buy token packs |

## Database Tables

- `profiles` — user info, languages, interests, timezone
- `token_balances` / `token_transactions` — token economy
- `matches` — connections with compatibility scores
- `conversations` / `messages` — chat with translation + moderation
- `mood_checkins` — wellness tracking
- `video_sessions` — video billing records

## Token Costs

- **Match:** 10 tokens
- **Video:** 5 tokens per minute
- **Starter packs:** $5 → 100 tokens, $10 → 250 tokens

## Mobile

Responsive Tailwind UI with bottom navigation on mobile and hamburger menu.
