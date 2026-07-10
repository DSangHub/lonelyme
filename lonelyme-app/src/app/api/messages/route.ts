import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { moderateMessage } from "@/lib/moderation";
import { translateText } from "@/lib/translation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return NextResponse.json({ messages: messages ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, content, targetLanguage } = await request.json();

  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const moderation = await moderateMessage(content);
  if (!moderation.safe) {
    return NextResponse.json(
      {
        error: "Message blocked by safety filter",
        reason: moderation.reason,
        severity: moderation.severity,
      },
      { status: 403 }
    );
  }

  let translatedContent: string | null = null;
  if (targetLanguage) {
    translatedContent = await translateText(content, targetLanguage);
  }

  const service = await createServiceClient();
  const { data: message, error } = await service
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
      translated_content: translatedContent,
      target_language: targetLanguage ?? null,
      moderation_status: moderation.severity === "low" ? "approved" : "flagged",
      moderation_reason: moderation.reason || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json({ message });
}
