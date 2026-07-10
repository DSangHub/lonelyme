const MODERATION_SYSTEM_PROMPT = `You are a safety moderator for LonelyMe, a platonic global friendship app.
Analyze the message for: scams, romance/dating pressure, harassment, hate speech, explicit content, financial requests, or manipulation.

Respond ONLY with valid JSON:
{"safe": true/false, "reason": "brief explanation if unsafe", "severity": "low"|"medium"|"high"}

LonelyMe is platonic-only. Flag romantic advances, scam patterns, and inappropriate content.`;

const FLAGGED_KEYWORDS = [
  "send money",
  "wire transfer",
  "crypto",
  "nude",
  "sexy",
  "bitcoin",
  "cashapp",
  "venmo me",
  "sugar daddy",
  "sugar mommy",
];

export type ModerationResult = {
  safe: boolean;
  reason: string;
  severity: "low" | "medium" | "high";
};

export async function moderateMessage(content: string): Promise<ModerationResult> {
  const provider = process.env.MODERATION_PROVIDER ?? "gemini";

  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    return moderateWithGemini(content);
  }

  return moderateWithKeywords(content);
}

async function moderateWithGemini(content: string): Promise<ModerationResult> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: MODERATION_SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: content }] }],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
        }),
      }
    );

    if (!res.ok) throw new Error("Gemini moderation failed");

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(text) as ModerationResult;
    return {
      safe: Boolean(parsed.safe),
      reason: parsed.reason ?? "",
      severity: parsed.severity ?? "low",
    };
  } catch {
    return moderateWithKeywords(content);
  }
}

function moderateWithKeywords(content: string): ModerationResult {
  const lower = content.toLowerCase();
  for (const keyword of FLAGGED_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        safe: false,
        reason: `Flagged for potentially unsafe content: "${keyword}"`,
        severity: "medium",
      };
    }
  }
  return { safe: true, reason: "", severity: "low" };
}
