"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types/database";
import Link from "next/link";

type ChatRoomProps = {
  conversationId: string;
  userId: string;
  partnerName: string;
};

const LANGUAGES = ["English", "Spanish", "French", "German", "Japanese", "Korean", "Portuguese", "Arabic"];

export function ChatRoom({ conversationId, userId, partnerName }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function loadMessages() {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await res.json();
      setMessages(data.messages ?? []);
    }
    loadMessages();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    setError("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content: input, targetLanguage }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to send");
      if (data.reason) setError(`${data.error}: ${data.reason}`);
    } else {
      setInput("");
    }

    setSending(false);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h2 className="font-semibold text-gray-900">Chat with {partnerName}</h2>
          <p className="text-sm text-gray-500">Real-time translation enabled</p>
        </div>
        <Link
          href={`/video/${conversationId}`}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Start Video
        </Link>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === userId;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                <p>{msg.content}</p>
                {msg.translated_content && (
                  <p className={`mt-1 text-sm ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
                    🌐 {msg.translated_content}
                  </p>
                )}
                {msg.moderation_status === "flagged" && (
                  <p className="mt-1 text-xs text-amber-300">⚠️ Flagged for review</p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-100 p-4">
        <div className="mb-3 flex items-center gap-3">
          <label className="text-sm text-gray-600">Translate to:</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
