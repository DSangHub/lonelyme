#!/usr/bin/env bash
# Create Stripe test products for LonelyMe token packs.
# Requires: stripe CLI logged in (stripe login) and STRIPE_SECRET_KEY in .env.local
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v stripe &>/dev/null; then
  echo "Install Stripe CLI: https://stripe.com/docs/stripe-cli"
  exit 1
fi

echo "Creating LonelyMe test products..."

PRODUCT=$(stripe products create \
  --name="LonelyMe Starter Tokens" \
  --description="Token packs for LonelyMe sandbox" \
  -d "metadata[app]=lonelyme" \
  --format=json | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)

PRICE_5=$(stripe prices create \
  --product="$PRODUCT" \
  --unit-amount=500 \
  --currency=usd \
  -d "metadata[pack_id]=starter_5" \
  -d "metadata[tokens]=100" \
  --format=json | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)

PRICE_10=$(stripe prices create \
  --product="$PRODUCT" \
  --unit-amount=1000 \
  --currency=usd \
  -d "metadata[pack_id]=starter_10" \
  -d "metadata[tokens]=250" \
  --format=json | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo "Add these to your .env.local:"
echo "STRIPE_PRICE_STARTER_5=$PRICE_5"
echo "STRIPE_PRICE_STARTER_10=$PRICE_10"
echo ""
echo "Start webhook forwarding:"
echo "  stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo "  (copy whsec_... to STRIPE_WEBHOOK_SECRET)"
