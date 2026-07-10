import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, getPackPriceId, getPackById } from "@/lib/stripe";
import { isMockStripe } from "@/lib/sandbox";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { packId } = await request.json();

  // Sandbox: use mock checkout when Stripe is in mock mode
  if (isMockStripe()) {
    const pack = getPackById(packId);
    if (!pack) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }
    return NextResponse.json({
      mock: true,
      packId,
      message: "Use mock checkout endpoint in sandbox mode",
    });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured. Set STRIPE_MODE=mock for sandbox or add Stripe keys." },
      { status: 503 }
    );
  }

  try {
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
