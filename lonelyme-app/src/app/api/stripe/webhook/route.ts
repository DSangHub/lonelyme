import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { creditTokens } from "@/lib/tokens";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const tokens = parseInt(session.metadata?.tokens ?? "0", 10);
    const packId = session.metadata?.pack_id ?? "unknown";

    if (userId && tokens > 0) {
      const supabase = await createServiceClient();
      const { data: existing } = await supabase
        .from("token_transactions")
        .select("id")
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (!existing) {
        await creditTokens(
          userId,
          tokens,
          `Purchased ${packId} pack`,
          session.id
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
