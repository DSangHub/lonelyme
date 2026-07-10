import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { creditTokens } from "@/lib/tokens";
import { getPackById } from "@/lib/stripe";
import { isMockStripe, isSandboxMode } from "@/lib/sandbox";

/**
 * Sandbox mock checkout — credits tokens instantly without Stripe.
 * Only available when SANDBOX_MODE=true and STRIPE_MODE=mock.
 */
export async function POST(request: Request) {
  if (!isSandboxMode() || !isMockStripe()) {
    return NextResponse.json({ error: "Mock checkout only in sandbox mode" }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { packId } = await request.json();
  const pack = getPackById(packId);

  if (!pack) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  const mockSessionId = `mock_${Date.now()}_${packId}`;
  await creditTokens(
    user.id,
    pack.tokens,
    `[SANDBOX] Mock purchase: ${pack.name}`,
    mockSessionId
  );

  return NextResponse.json({
    success: true,
    tokens: pack.tokens,
    redirect: `${process.env.NEXT_PUBLIC_APP_URL}/tokens?success=true&sandbox=mock`,
  });
}
