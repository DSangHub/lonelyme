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

  const { data: balance } = await supabase
    .from("token_balances")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, user1_id, user2_id, created_at")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen">
      <Navbar balance={balance?.balance ?? 0} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Welcome, {profile?.display_name ?? "friend"} 👋
        </h1>
        <p className="mb-10 text-gray-600">Ready to connect with someone new?</p>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <Link
            href="/match"
            className="rounded-3xl bg-blue-600 p-8 text-white transition hover:bg-blue-700"
          >
            <div className="mb-3 text-3xl">🌍</div>
            <h2 className="text-xl font-semibold">Find a Match</h2>
            <p className="mt-2 text-blue-100">10 tokens per match</p>
          </Link>
          <Link
            href="/tokens"
            className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-3 text-3xl">🪙</div>
            <h2 className="text-xl font-semibold">Buy Tokens</h2>
            <p className="mt-2 text-gray-600">$5–10 starter packs</p>
          </Link>
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-3 text-3xl">💬</div>
            <h2 className="text-xl font-semibold">Your Balance</h2>
            <p className="mt-2 text-3xl font-bold text-blue-600">{balance?.balance ?? 0}</p>
          </div>
        </div>

        {matches && matches.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Recent Matches</h2>
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-6 py-4"
                >
                  <span className="text-gray-700">Match from {new Date(match.created_at).toLocaleDateString()}</span>
                  <MatchChatLink matchId={match.id} userId={user.id} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

async function MatchChatLink({ matchId }: { matchId: string; userId: string }) {
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
      className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
    >
      Open Chat
    </Link>
  );
}
