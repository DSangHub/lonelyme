"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const supabase = useMemo(() => createClient(), []);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const redirectTo = `${window.location.origin}/api/auth/callback?redirect=/dashboard`;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        data: mode === "signup" ? { username, display_name: username } : undefined,
      },
    });

    if (otpError) {
      setError(otpError.message);
    } else {
      setMessage("Check your email for a magic link to sign in. No password needed.");
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto w-full max-w-md px-4">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
        {mode === "login" ? "Welcome back" : "Join LonelyMe"}
      </h1>
      <p className="mb-8 text-gray-600">
        {mode === "login"
          ? "We'll email you a secure magic link — no password required."
          : "Sign up with your email. Get 50 free starter tokens for platonic global chats."}
      </p>

      <form onSubmit={handleMagicLink} className="space-y-4">
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-2xl border border-gray-300 px-5 py-4 text-base focus:border-blue-500 focus:outline-none"
          />
        )}
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-2xl border border-gray-300 px-5 py-4 text-base focus:border-blue-500 focus:outline-none"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && (
          <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-medium text-blue-600 hover:underline">
              Create account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>

      <p className="mt-4 text-center text-xs text-gray-400">
        Platonic friendships only · AI-moderated · Privacy first
      </p>
    </div>
  );
}
