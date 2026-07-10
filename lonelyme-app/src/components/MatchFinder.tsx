"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MATCH_COST = 10;

export function MatchFinder({ balance }: { balance: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function findMatch() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/match", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Match failed");
      setLoading(false);
      return;
    }

    router.push(`/chat/${data.conversationId}`);
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
        🌍
      </div>
      <h2 className="mb-3 text-2xl font-bold text-gray-900">Find a Global Friend</h2>
      <p className="mb-2 text-gray-600">
        Get matched with someone from another country. Start with text, move to video when ready.
      </p>
      <p className="mb-8 text-sm text-gray-500">
        Costs {MATCH_COST} tokens per match · You have {balance} tokens
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={findMatch}
        disabled={loading || balance < MATCH_COST}
        className="rounded-2xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Finding match..." : balance < MATCH_COST ? "Need more tokens" : "Find Match"}
      </button>

      {balance < MATCH_COST && (
        <p className="mt-4 text-sm text-blue-600">
          <a href="/tokens" className="hover:underline">
            Buy token packs →
          </a>
        </p>
      )}
    </div>
  );
}
