import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { spendTokens, VIDEO_COST_PER_MINUTE } from "@/lib/tokens";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, action, sessionId } = await request.json();
  const service = await createServiceClient();

  if (action === "start") {
    const spent = await spendTokens(
      user.id,
      VIDEO_COST_PER_MINUTE,
      "Video chat — first minute"
    );
    if (!spent) {
      return NextResponse.json(
        { error: "Insufficient tokens for video", required: VIDEO_COST_PER_MINUTE },
        { status: 402 }
      );
    }

    const { data: session } = await service
      .from("video_sessions")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        minutes_billed: 1,
        tokens_spent: VIDEO_COST_PER_MINUTE,
      })
      .select()
      .single();

    return NextResponse.json({ sessionId: session?.id, tokensPerMinute: VIDEO_COST_PER_MINUTE });
  }

  if (action === "tick" && sessionId) {
    const spent = await spendTokens(
      user.id,
      VIDEO_COST_PER_MINUTE,
      "Video chat — additional minute"
    );
    if (!spent) {
      return NextResponse.json({ error: "Out of tokens", endSession: true }, { status: 402 });
    }

    const { data: session } = await service
      .from("video_sessions")
      .select("minutes_billed, tokens_spent")
      .eq("id", sessionId)
      .single();

    await service
      .from("video_sessions")
      .update({
        minutes_billed: (session?.minutes_billed ?? 0) + 1,
        tokens_spent: (session?.tokens_spent ?? 0) + VIDEO_COST_PER_MINUTE,
      })
      .eq("id", sessionId);

    return NextResponse.json({ ok: true });
  }

  if (action === "end" && sessionId) {
    await service
      .from("video_sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", sessionId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
