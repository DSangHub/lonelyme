export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { TokenShop } from "@/components/TokenShop";

type Props = {
  searchParams: Promise<{ success?: string; canceled?: string }>;
};

export default async function TokensPage({ searchParams }: Props) {
  const { success, canceled } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: balance } = await supabase
    .from("token_balances")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const { data: transactions } = await supabase
    .from("token_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen">
      <Navbar balance={balance?.balance ?? 0} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Token Packs</h1>
        <p className="mb-2 text-gray-600">
          Current balance: <strong>{balance?.balance ?? 0} tokens</strong>
        </p>

        {success && (
          <div className="mb-6 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
            Payment successful! Tokens will appear shortly.
          </div>
        )}
        {canceled && (
          <div className="mb-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Checkout canceled.
          </div>
        )}

        <TokenShop />

        {transactions && transactions.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">Recent Transactions</h2>
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                >
                  <span className="text-gray-700">{tx.description ?? tx.type}</span>
                  <span className={tx.amount > 0 ? "text-green-600" : "text-red-600"}>
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
