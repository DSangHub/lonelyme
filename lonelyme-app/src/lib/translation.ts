import { isMockTranslation } from "@/lib/sandbox";

const MOCK_PHRASES: Record<string, Record<string, string>> = {
  hello: { Spanish: "Hola", French: "Bonjour", Japanese: "こんにちは", Portuguese: "Olá" },
  "how are you": { Spanish: "¿Cómo estás?", French: "Comment ça va?", Japanese: "お元気ですか？" },
  friend: { Spanish: "amigo", French: "ami", Japanese: "友達", Portuguese: "amigo" },
};

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage = "auto"
): Promise<string> {
  if (isMockTranslation()) {
    return mockTranslate(text, targetLanguage);
  }

  const provider = process.env.TRANSLATION_PROVIDER ?? "mock";

  if (provider === "deepl" && process.env.DEEPL_API_KEY) {
    return translateWithDeepL(text, targetLanguage, sourceLanguage);
  }

  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    return translateWithGemini(text, targetLanguage);
  }

  return mockTranslate(text, targetLanguage);
}

async function translateWithDeepL(
  text: string,
  targetLanguage: string,
  sourceLanguage: string
): Promise<string> {
  const params = new URLSearchParams({
    text,
    target_lang: targetLanguage.slice(0, 2).toUpperCase(),
  });
  if (sourceLanguage !== "auto") {
    params.set("source_lang", sourceLanguage.slice(0, 2).toUpperCase());
  }

  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!res.ok) throw new Error("DeepL translation failed");
  const data = await res.json();
  return data.translations[0].text as string;
}

async function translateWithGemini(text: string, targetLanguage: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate the following text to ${targetLanguage}. Return ONLY the translation, no explanation:\n\n${text}`,
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );

  if (!res.ok) throw new Error("Gemini translation failed");
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? text;
}

function mockTranslate(text: string, targetLanguage: string): string {
  const lower = text.toLowerCase().trim();
  for (const [phrase, translations] of Object.entries(MOCK_PHRASES)) {
    if (lower.includes(phrase) && translations[targetLanguage]) {
      return translations[targetLanguage];
    }
  }
  return `[${targetLanguage}] ${text}`;
}
