import { createServiceClient } from "@/lib/supabase/server";

const MATCH_COST = 10;
const VIDEO_COST_PER_MINUTE = 5;

export async function getTokenBalance(userId: string): Promise<number> {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("token_balances")
    .select("balance")
    .eq("user_id", userId)
    .single();
  return data?.balance ?? 0;
}

export async function spendTokens(
  userId: string,
  amount: number,
  description: string
): Promise<boolean> {
  const supabase = await createServiceClient();
  const balance = await getTokenBalance(userId);
  if (balance < amount) return false;

  const { error: updateError } = await supabase
    .from("token_balances")
    .update({ balance: balance - amount, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (updateError) return false;

  await supabase.from("token_transactions").insert({
    user_id: userId,
    amount: -amount,
    type: "spend",
    description,
  });

  return true;
}

export async function creditTokens(
  userId: string,
  amount: number,
  description: string,
  stripeSessionId?: string
): Promise<void> {
  const supabase = await createServiceClient();
  const balance = await getTokenBalance(userId);

  await supabase
    .from("token_balances")
    .update({ balance: balance + amount, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  await supabase.from("token_transactions").insert({
    user_id: userId,
    amount,
    type: "purchase",
    description,
    stripe_session_id: stripeSessionId,
  });
}

export { MATCH_COST, VIDEO_COST_PER_MINUTE };
