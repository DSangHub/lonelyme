export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { WellnessDashboard } from "@/components/WellnessDashboard";

export default async function WellnessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: balance } = await supabase
    .from("token_balances")
    .select("balance")
    .eq("user_id", user.id)
    .single();

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
    .select("minutes_billed")
    .eq("user_id", user.id);

  const totalVideoMinutes = videoSessions?.reduce((sum, s) => sum + s.minutes_billed, 0) ?? 0;
  const avgMood =
    moodCheckins && moodCheckins.length > 0
      ? moodCheckins.reduce((sum, m) => sum + m.mood, 0) / moodCheckins.length
      : null;

  const initialStats = {
    connections: connectionCount ?? 0,
    totalVideoMinutes,
    moodCheckins: moodCheckins ?? [],
    avgMood,
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar balance={balance?.balance ?? 0} />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Wellness</h1>
        <p className="mb-8 text-sm text-gray-600 sm:text-base">
          Track your connections and mood as you build meaningful friendships.
        </p>
        <WellnessDashboard initialStats={initialStats} />
      </main>
    </div>
  );
}
