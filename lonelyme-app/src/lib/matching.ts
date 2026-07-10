import type { Profile, MatchSuggestion } from "@/types/database";

type Candidate = Pick<
  Profile,
  "id" | "display_name" | "username" | "languages" | "interests" | "timezone"
>;

function overlapScore(a: string[], b: string[]): { score: number; shared: string[] } {
  const setB = new Set(b.map((s) => s.toLowerCase()));
  const shared = a.filter((item) => setB.has(item.toLowerCase()));
  const union = new Set([...a, ...b].map((s) => s.toLowerCase()));
  if (union.size === 0) return { score: 0, shared: [] };
  return { score: Math.round((shared.length / union.size) * 100), shared };
}

function timezoneScore(tzA: string, tzB: string): { score: number; reason: string | null } {
  try {
    const now = new Date();
    const offsetA = getUtcOffsetHours(tzA, now);
    const offsetB = getUtcOffsetHours(tzB, now);
    const diff = Math.abs(offsetA - offsetB);

    if (diff <= 2) return { score: 90, reason: "Similar time zone — easy to chat live" };
    if (diff <= 5) return { score: 70, reason: "Overlapping hours for conversation" };
    if (diff <= 8) return { score: 50, reason: "Different schedule — async chat works great" };
    return { score: 30, reason: "Far-apart time zones — cultural exchange focus" };
  } catch {
    return { score: 50, reason: null };
  }
}

function getUtcOffsetHours(timezone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const match = offsetPart.match(/GMT([+-]?\d+(?::\d+)?)?/);
  if (!match?.[1]) return 0;
  const [h, m] = match[1].split(":").map(Number);
  return h + (m || 0) / 60;
}

export function scoreMatch(
  user: Pick<Profile, "languages" | "interests" | "timezone">,
  candidate: Candidate
): MatchSuggestion {
  const lang = overlapScore(user.languages ?? [], candidate.languages ?? []);
  const interests = overlapScore(user.interests ?? [], candidate.interests ?? []);
  const tz = timezoneScore(user.timezone ?? "UTC", candidate.timezone ?? "UTC");

  const score = Math.round(lang.score * 0.35 + interests.score * 0.4 + tz.score * 0.25);

  const reasons: string[] = [];
  if (lang.shared.length > 0) {
    reasons.push(`Shared languages: ${lang.shared.join(", ")}`);
  } else if (candidate.languages.length > 0) {
    reasons.push(`Practice ${candidate.languages.slice(0, 2).join(" or ")} together`);
  }
  if (interests.shared.length > 0) {
    reasons.push(`Both into ${interests.shared.slice(0, 3).join(", ")}`);
  }
  if (tz.reason) reasons.push(tz.reason);

  if (reasons.length === 0) {
    reasons.push("New cultural perspective from another country");
  }

  return {
    profile: candidate,
    score: Math.min(100, Math.max(10, score)),
    reasons,
  };
}

export function rankCandidates(
  user: Pick<Profile, "languages" | "interests" | "timezone">,
  candidates: Candidate[],
  limit = 10
): MatchSuggestion[] {
  return candidates
    .map((c) => scoreMatch(user, c))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
