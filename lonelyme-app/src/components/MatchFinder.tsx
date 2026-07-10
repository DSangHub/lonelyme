"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MatchSuggestion } from "@/types/database";

const MATCH_COST = 10;

export function MatchFinder({ balance }: { balance: number }) {
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/match");
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setLoadingSuggestions(false);
    }
    load();
  }, []);

  async function connectWith(partnerId?: string) {
    setLoading(true);
    setError("");

    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partnerId ? { partnerId } : {}),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Match failed");
      setLoading(false);
      return;
    }

    router.push(`/chat/${data.conversationId}`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl sm:h-20 sm:w-20 sm:text-4xl">
          🌍
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
          Find a Platonic Global Friend
        </h2>
        <p className="mb-2 text-sm text-gray-600 sm:text-base">
          AI suggests friends based on languages, interests, and time zones.
        </p>
        <p className="mb-6 text-xs text-gray-500 sm:text-sm">
          {MATCH_COST} tokens per match · Balance: {balance}
        </p>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          onClick={() => connectWith()}
          disabled={loading || balance < MATCH_COST}
          className="w-full rounded-2xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Connecting..." : balance < MATCH_COST ? "Need more tokens" : "Quick Match"}
        </button>

        {balance < MATCH_COST && (
          <p className="mt-4 text-sm text-blue-600">
            <a href="/tokens" className="hover:underline">
              Buy $5–10 token packs →
            </a>
          </p>
        )}
      </div>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Suggested Friends</h3>
        {loadingSuggestions ? (
          <p className="text-sm text-gray-500">Finding compatible friends...</p>
        ) : suggestions.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-600">
            No suggestions yet. Complete your profile or check back when more users join.
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div
                key={s.profile.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {s.profile.display_name ?? s.profile.username}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {s.score}% match
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {s.profile.languages?.join(", ")} · {s.profile.timezone}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{s.reasons[0]}</p>
                </div>
                <button
                  onClick={() => connectWith(s.profile.id)}
                  disabled={loading || balance < MATCH_COST}
                  className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
