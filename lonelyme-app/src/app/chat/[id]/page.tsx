export const dynamic = "force-dynamic";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { ChatRoom } from "@/components/ChatRoom";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ChatPage({ params }: Props) {
  const { id: conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, match_id")
    .eq("id", conversationId)
    .single();

  if (!conversation) notFound();

  const { data: match } = await supabase
    .from("matches")
    .select("user1_id, user2_id")
    .eq("id", conversation.match_id)
    .single();

  if (!match) notFound();

  const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id;
  const { data: partner } = await supabase
    .from("profiles")
    .select("display_name, username")
    .eq("id", partnerId)
    .single();

  const { data: balance } = await supabase
    .from("token_balances")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen">
      <Navbar balance={balance?.balance ?? 0} />
      <main className="mx-auto max-w-4xl px-4 py-4 pb-24 sm:px-6 sm:py-6 md:pb-6">
        <ChatRoom
          conversationId={conversationId}
          userId={user.id}
          partnerName={partner?.display_name ?? partner?.username ?? "Friend"}
        />
      </main>
    </div>
  );
}
