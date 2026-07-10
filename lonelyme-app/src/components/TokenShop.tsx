"use client";

import { TOKEN_PACKS } from "@/types/database";
import { useState } from "react";

export function TokenShop() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handlePurchase(packId: string) {
    setLoading(packId);
    setError("");

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId }),
    });

    const data = await res.json();
    if (data.url) {
      window.open(data.url, "_self");
    } else {
      setError(data.error ?? "Checkout unavailable. Configure Stripe price IDs in .env.local");
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
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
            {loading === pack.id ? "Redirecting..." : `Buy $${pack.price} Pack`}
          </button>
        </div>
      ))}
      {error && <p className="col-span-full text-sm text-red-600">{error}</p>}
    </div>
  );
}
