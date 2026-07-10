"use client";

import { TOKEN_PACKS } from "@/types/database";
import { useState } from "react";

const isSandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true";
const isMockStripe = process.env.NEXT_PUBLIC_STRIPE_MODE === "mock";

export function TokenShop() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handlePurchase(packId: string) {
    setLoading(packId);
    setError("");

    // Sandbox mock Stripe — instant token credit, no real payment
    if (isSandbox && isMockStripe) {
      const res = await fetch("/api/stripe/mock-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (data.success && data.redirect) {
        window.open(data.redirect, "_self");
        return;
      }
      setError(data.error ?? "Mock checkout failed");
      setLoading(null);
      return;
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId }),
    });

    const data = await res.json();
    if (data.url) {
      window.open(data.url, "_self");
    } else {
      setError(data.error ?? "Checkout unavailable. Configure Stripe or use sandbox mock mode.");
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {isSandbox && isMockStripe && (
        <div className="col-span-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Sandbox mode:</strong> Purchases use mock Stripe — tokens are credited instantly, no real charge.
        </div>
      )}
      {TOKEN_PACKS.map((pack) => (
        <div
          key={pack.id}
          className={`rounded-3xl border p-8 ${
            pack.id === "starter_10" ? "border-2 border-blue-600" : "border-gray-200"
          }`}
        >
          <div className="mb-2 text-sm uppercase tracking-widest text-gray-500">
            {pack.name}
          </div>
          <div className="mb-2 text-4xl font-bold">${pack.price}</div>
          <div className="mb-6 text-gray-600">{pack.description}</div>
          <ul className="mb-8 space-y-2 text-sm text-gray-700">
            <li>✓ {pack.tokens} tokens</li>
            <li>✓ Video chat minutes</li>
            <li>✓ Priority matching</li>
          </ul>
          <button
            onClick={() => handlePurchase(pack.id)}
            disabled={loading === pack.id}
            className="w-full rounded-2xl bg-blue-600 py-4 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading === pack.id
              ? "Processing..."
              : isMockStripe
                ? `Get ${pack.tokens} Tokens (Mock)`
                : `Buy $${pack.price} Pack`}
          </button>
        </div>
      ))}
      {error && <p className="col-span-full text-sm text-red-600">{error}</p>}
    </div>
  );
}
