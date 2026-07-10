"use client";

import { useState } from "react";
import { MoodCheckin } from "./MoodCheckin";
import { MOOD_LABELS } from "@/types/database";

type WellnessStats = {
  connections: number;
  totalVideoMinutes: number;
  moodCheckins: { mood: number; created_at: string }[];
  avgMood: number | null;
};

export function WellnessDashboard({ initialStats }: { initialStats: WellnessStats }) {
  const [stats, setStats] = useState(initialStats);

  async function loadStats() {
    const res = await fetch("/api/wellness");
    const data = await res.json();
    setStats(data);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Connections" value={stats.connections} icon="🤝" />
        <StatCard label="Video Minutes" value={stats.totalVideoMinutes} icon="📹" />
        <StatCard
          label="Avg Mood"
          value={
            stats.avgMood
              ? MOOD_LABELS[Math.round(stats.avgMood) - 1]?.split(" ")[0] ?? "—"
              : "—"
          }
          icon="💚"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      <MoodCheckin onSaved={loadStats} />

      {stats.moodCheckins.length > 0 && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Mood</h3>
          <div className="flex h-32 items-end justify-between gap-1">
            {[...stats.moodCheckins].reverse().map((c, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg bg-blue-500 transition-all"
                  style={{ height: `${(c.mood / 5) * 100}%`, minHeight: "8px" }}
                />
                <span className="text-[10px] text-gray-400">
                  {new Date(c.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Platonic focus:</strong> LonelyMe is built for meaningful global friendship —
        not dating. Our AI monitors chats to keep connections safe and respectful.
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: string | number;
  icon: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm ${className}`}
    >
      <div className="mb-1 text-2xl">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
