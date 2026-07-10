import Stripe from "stripe";
import { TOKEN_PACKS } from "@/types/database";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

export function getPackPriceId(packId: string): string | null {
  const map: Record<string, string | undefined> = {
    starter_5: process.env.STRIPE_PRICE_STARTER_5,
    starter_10: process.env.STRIPE_PRICE_STARTER_10,
  };
  return map[packId] ?? null;
}

export function getPackById(packId: string) {
  return TOKEN_PACKS.find((p) => p.id === packId);
}

export function getTokenAmountForPack(packId: string): number {
  return getPackById(packId)?.tokens ?? 0;
}
