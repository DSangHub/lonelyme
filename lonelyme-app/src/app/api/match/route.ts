import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { spendTokens, MATCH_COST } from "@/lib/tokens";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const spent = await spendTokens(user.id, MATCH_COST, "Match with global friend");
  if (!spent) {
    return NextResponse.json(
      { error: "Insufficient tokens", required: MATCH_COST },
      { status: 402 }
    );
  }

  const service = await createServiceClient();

  const { data: candidates } = await service
    .from("profiles")
    .select("id, display_name, username, languages, interests")
    .eq("is_available", true)
    .neq("id", user.id)
    .limit(20);

  if (!candidates?.length) {
    const { getTokenBalance } = await import("@/lib/tokens");
    const currentBalance = await getTokenBalance(user.id);
    await service
      .from("token_balances")
      .update({
        balance: currentBalance + MATCH_COST,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
    return NextResponse.json({ error: "No matches available right now" }, { status: 404 });
  }

  const match = candidates[Math.floor(Math.random() * candidates.length)];
  const [user1, user2] = [user.id, match.id].sort();

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
      .insert({ user1_id: user1, user2_id: user2 })
      .select("id")
      .single();

    if (error || !newMatch) {
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
    partner: match,
  });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = await createServiceClient();
  const { data: matches } = await service
    .from("matches")
    .select("id, user1_id, user2_id, status, created_at")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return NextResponse.json({ matches: matches ?? [] });
}
