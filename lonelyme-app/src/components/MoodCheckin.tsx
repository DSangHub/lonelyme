"use client";

import { useState } from "react";
import { MOOD_LABELS } from "@/types/database";

export function MoodCheckin({ onSaved }: { onSaved?: () => void }) {
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/wellness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, note }),
    });

    if (res.ok) {
      setSaved(true);
      setNote("");
      onSaved?.();
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-lg font-semibold text-gray-900">How are you feeling today?</h3>
      <p className="mb-4 text-sm text-gray-500">Private mood check-in — track your wellness journey</p>

      <div className="mb-4 flex flex-wrap justify-between gap-2">
        {MOOD_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setMood(i + 1)}
            className={`flex-1 min-w-[60px] rounded-xl px-2 py-3 text-xs font-medium transition sm:text-sm ${
              mood === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note (private)"
        rows={2}
        className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : saved ? "Saved ✓" : "Save Check-in"}
      </button>
    </form>
  );
}
