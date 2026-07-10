#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "🧪 LonelyMe Sandbox Setup"
echo "========================="

# 1. Copy sandbox env
if [ ! -f .env.local ]; then
  cp env.sandbox.local .env.local
  echo "✓ Created .env.local from env.sandbox.local"
else
  echo "⚠ .env.local already exists — skipping copy"
  echo "  To reset: cp env.sandbox.local .env.local"
fi

# 2. Check Docker for Supabase local
if ! command -v docker &>/dev/null; then
  echo ""
  echo "⚠ Docker not found — cannot start Supabase local."
  echo "  Options:"
  echo "    A) Install Docker, then run: npm run sandbox:start"
  echo "    B) Use cloud test mode: cp env.cloud-test.local .env.local"
  echo "       Then add your Supabase cloud keys from supabase.com"
  echo ""
else
  echo "✓ Docker found"
  if command -v supabase &>/dev/null || npx supabase --version &>/dev/null 2>&1; then
    echo "✓ Supabase CLI available"
    echo ""
    read -p "Start Supabase local now? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      npx supabase start
      npx supabase db reset
      echo ""
      echo "✓ Supabase local running with seed data"
      echo "  Studio:  http://127.0.0.1:54323"
      echo "  Inbucket: http://127.0.0.1:54324  (magic link emails)"
    fi
  fi
fi

# 3. Stripe setup hint
echo ""
echo "Stripe:"
echo "  Mock mode (default): tokens credited instantly, no Stripe account needed"
echo "  Test mode: run 'npm run sandbox:stripe' after adding sk_test_ key to .env.local"
echo ""
echo "Start the app:"
echo "  npm run dev"
echo ""
echo "Test users (after db reset):"
echo "  maria@lonelyme.test  — Spanish, Travel/Music"
echo "  kenji@lonelyme.test  — Japanese, Gaming/Tech"
echo "  amara@lonelyme.test  — English/French, Books/Art"
echo "  lucas@lonelyme.test  — Portuguese, Sports/Music"
echo ""
echo "Sign up with any email — magic links appear in Inbucket (local) or your inbox (cloud)"
