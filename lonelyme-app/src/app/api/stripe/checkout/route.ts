import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, getPackPriceId, getPackById } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured. Add STRIPE_SECRET_KEY and price IDs to .env.local" },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packId } = await request.json();
    const pack = getPackById(packId);
    const priceId = getPackPriceId(packId);

    if (!pack || !priceId) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        user_id: user.id,
        pack_id: packId,
        tokens: String(pack.tokens),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tokens?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tokens?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
