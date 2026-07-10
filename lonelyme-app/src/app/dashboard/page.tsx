export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.interests?.length || !profile?.languages?.length) {
    redirect("/onboarding");
  }

  const { data: balance } = await supabase
    .from("token_balances")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, user1_id, user2_id, compatibility_score, match_reasons, created_at")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar balance={balance?.balance ?? 0} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Hi, {profile?.display_name ?? "friend"} 👋
        </h1>
        <p className="mb-8 text-sm text-gray-600 sm:text-base">
          Platonic global friendship — safe, translated, meaningful.
        </p>

        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Link
            href="/match"
            className="col-span-2 rounded-2xl bg-blue-600 p-5 text-white transition hover:bg-blue-700 sm:rounded-3xl sm:p-6"
          >
            <div className="mb-2 text-2xl sm:text-3xl">🌍</div>
            <h2 className="font-semibold sm:text-lg">Find Friends</h2>
            <p className="mt-1 text-xs text-blue-100 sm:text-sm">AI-matched · 10 tokens</p>
          </Link>
          <Link
            href="/wellness"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:rounded-3xl sm:p-6"
          >
            <div className="mb-2 text-2xl">💚</div>
            <h2 className="text-sm font-semibold sm:text-base">Wellness</h2>
          </Link>
          <Link
            href="/tokens"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:rounded-3xl sm:p-6"
          >
            <div className="mb-2 text-2xl">🪙</div>
            <h2 className="text-sm font-semibold sm:text-base">{balance?.balance ?? 0} tokens</h2>
          </Link>
        </div>

        {matches && matches.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold sm:text-xl">Your Connections</h2>
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div>
                    <span className="text-sm text-gray-700 sm:text-base">
                      Connection · {new Date(match.created_at).toLocaleDateString()}
                    </span>
                    {match.compatibility_score > 0 && (
                      <p className="text-xs text-blue-600">{match.compatibility_score}% compatible</p>
                    )}
                  </div>
                  <MatchChatLink matchId={match.id} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

async function MatchChatLink({ matchId }: { matchId: string }) {
  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("match_id", matchId)
    .single();

  if (!conversation) return null;

  return (
    <Link
      href={`/chat/${conversation.id}`}
      className="rounded-xl bg-blue-50 px-4 py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-100"
    >
      Open Chat
    </Link>
  );
}
