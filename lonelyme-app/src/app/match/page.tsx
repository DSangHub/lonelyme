export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { MatchFinder } from "@/components/MatchFinder";

export default async function MatchPage() {
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

  return (
    <div className="min-h-screen">
      <Navbar balance={balance?.balance ?? 0} />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <MatchFinder balance={balance?.balance ?? 0} />
      </main>
    </div>
  );
}
