import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count: connectionCount } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  const { data: moodCheckins } = await supabase
    .from("mood_checkins")
    .select("mood, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(14);

  const { data: videoSessions } = await supabase
    .from("video_sessions")
    .select("minutes_billed, tokens_spent")
    .eq("user_id", user.id);

  const totalVideoMinutes = videoSessions?.reduce((sum, s) => sum + s.minutes_billed, 0) ?? 0;
  const avgMood =
    moodCheckins && moodCheckins.length > 0
      ? moodCheckins.reduce((sum, m) => sum + m.mood, 0) / moodCheckins.length
      : null;

  return NextResponse.json({
    connections: connectionCount ?? 0,
    totalVideoMinutes,
    moodCheckins: moodCheckins ?? [],
    avgMood,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mood, note } = await request.json();

  if (!mood || mood < 1 || mood > 5) {
    return NextResponse.json({ error: "Mood must be 1-5" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("mood_checkins")
    .insert({ user_id: user.id, mood, note: note ?? "" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save check-in" }, { status: 500 });
  }

  return NextResponse.json({ checkin: data });
}
