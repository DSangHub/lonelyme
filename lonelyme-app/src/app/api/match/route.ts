import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { spendTokens, MATCH_COST } from "@/lib/tokens";
import { rankCandidates } from "@/lib/matching";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("languages, interests, timezone")
    .eq("id", user.id)
    .single();

  if (!myProfile) {
    return NextResponse.json({ error: "Complete your profile first" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data: candidates } = await service
    .from("profiles")
    .select("id, display_name, username, languages, interests, timezone")
    .eq("is_available", true)
    .neq("id", user.id)
    .limit(50);

  const suggestions = rankCandidates(myProfile, candidates ?? [], 8);

  return NextResponse.json({ suggestions });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const targetUserId = body.partnerId as string | undefined;

  const spent = await spendTokens(user.id, MATCH_COST, "Match with global friend");
  if (!spent) {
    return NextResponse.json(
      { error: "Insufficient tokens", required: MATCH_COST },
      { status: 402 }
    );
  }

  const service = await createServiceClient();

  const { data: myProfile } = await service
    .from("profiles")
    .select("languages, interests, timezone")
    .eq("id", user.id)
    .single();

  const { data: candidates } = await service
    .from("profiles")
    .select("id, display_name, username, languages, interests, timezone")
    .eq("is_available", true)
    .neq("id", user.id)
    .limit(50);

  if (!candidates?.length || !myProfile) {
    await refundMatchTokens(service, user.id);
    return NextResponse.json({ error: "No matches available right now" }, { status: 404 });
  }

  let best = rankCandidates(myProfile, candidates, 1)[0];

  if (targetUserId) {
    const chosen = candidates.find((c) => c.id === targetUserId);
    if (chosen) {
      const { scoreMatch } = await import("@/lib/matching");
      best = scoreMatch(myProfile, chosen);
    }
  }

  const partner = best.profile;
  const [user1, user2] = [user.id, partner.id].sort();

  const { data: existingMatch } = await service
    .from("matches")
    .select("id")
    .eq("user1_id", user1)
    .eq("user2_id", user2)
    .maybeSingle();

  let matchId = existingMatch?.id;

  if (!matchId) {
    const { data: newMatch, error } = await service
      .from("matches")
      .insert({
        user1_id: user1,
        user2_id: user2,
        compatibility_score: best.score,
        match_reasons: best.reasons,
      })
      .select("id")
      .single();

    if (error || !newMatch) {
      await refundMatchTokens(service, user.id);
      return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
    }
    matchId = newMatch.id;
    await service.from("conversations").insert({ match_id: matchId });
  }

  const { data: conversation } = await service
    .from("conversations")
    .select("id")
    .eq("match_id", matchId)
    .single();

  return NextResponse.json({
    matchId,
    conversationId: conversation?.id,
    partner,
    compatibilityScore: best.score,
    matchReasons: best.reasons,
  });
}

async function refundMatchTokens(
  service: Awaited<ReturnType<typeof createServiceClient>>,
  userId: string
) {
  const { getTokenBalance, MATCH_COST } = await import("@/lib/tokens");
  const currentBalance = await getTokenBalance(userId);
  await service
    .from("token_balances")
    .update({
      balance: currentBalance + MATCH_COST,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}
