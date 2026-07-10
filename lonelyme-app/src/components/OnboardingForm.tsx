"use client";

import { useState } from "react";
import { INTEREST_OPTIONS, LANGUAGE_OPTIONS } from "@/types/database";
import { useRouter } from "next/navigation";

type OnboardingFormProps = {
  initial?: {
    display_name?: string | null;
    interests?: string[];
    languages?: string[];
    timezone?: string;
    bio?: string;
  };
};

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Kolkata",
  "Australia/Sydney",
];

export function OnboardingForm({ initial }: OnboardingFormProps) {
  const [displayName, setDisplayName] = useState(initial?.display_name ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [interests, setInterests] = useState<string[]>(initial?.interests ?? []);
  const [languages, setLanguages] = useState<string[]>(
    initial?.languages?.length ? initial.languages : ["English"]
  );
  const [timezone, setTimezone] = useState(
    initial?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function toggleItem(list: string[], item: string, setter: (v: string[]) => void) {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: displayName,
        bio,
        interests,
        languages,
        timezone,
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Display name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Languages you speak</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleItem(languages, lang, setLanguages)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                languages.includes(lang)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Interests</label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleItem(interests, item, setInterests)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                interests.includes(item)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Time zone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Short bio (optional)</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="What kind of platonic friend are you looking for?"
          className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || languages.length === 0}
        className="w-full rounded-2xl bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Complete Profile"}
      </button>
    </form>
  );
}
