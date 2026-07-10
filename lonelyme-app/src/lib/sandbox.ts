/**
 * Sandbox mode detection and configuration.
 * Set SANDBOX_MODE=true in .env.local for full dev sandbox.
 */

export function isSandboxMode(): boolean {
  return process.env.SANDBOX_MODE === "true";
}

export function isMockStripe(): boolean {
  return isSandboxMode() && process.env.STRIPE_MODE === "mock";
}

export function isMockTranslation(): boolean {
  const provider = process.env.TRANSLATION_PROVIDER ?? "mock";
  return provider === "mock" || (isSandboxMode() && !process.env.GEMINI_API_KEY && !process.env.DEEPL_API_KEY);
}

export function isMockModeration(): boolean {
  const provider = process.env.MODERATION_PROVIDER ?? "mock";
  return provider === "mock" || (isSandboxMode() && !process.env.GEMINI_API_KEY);
}

export const SANDBOX_DEFAULTS = {
  supabaseUrl: "http://127.0.0.1:54321",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
  supabaseServiceKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qkqsvr92yHHfAktuTF8FY",
  inbucketUrl: "http://127.0.0.1:54324",
  studioUrl: "http://127.0.0.1:54323",
} as const;
