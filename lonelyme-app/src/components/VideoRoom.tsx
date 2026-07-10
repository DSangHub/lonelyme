"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

type VideoRoomProps = {
  conversationId: string;
  partnerName: string;
  subtitleLanguage?: string;
};

const VIDEO_COST_PER_MINUTE = 5;

export function VideoRoom({
  conversationId,
  partnerName,
  subtitleLanguage = "English",
}: VideoRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const billingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [status, setStatus] = useState("Initializing...");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [translatedSubtitle, setTranslatedSubtitle] = useState("");
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [subtitlesOn, setSubtitlesOn] = useState(true);

  const translateSubtitle = useCallback(
    async (text: string) => {
      setSubtitle(text);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetLanguage: subtitleLanguage }),
        });
        const data = await res.json();
        setTranslatedSubtitle(data.translated ?? text);
      } catch {
        setTranslatedSubtitle(`[${subtitleLanguage}] ${text}`);
      }
    },
    [subtitleLanguage]
  );

  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function startSession() {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, action: "start" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start video session");
        return;
      }
      sessionIdRef.current = data.sessionId;
      setMinutesUsed(1);

      billingIntervalRef.current = setInterval(async () => {
        const tickRes = await fetch("/api/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            action: "tick",
            sessionId: sessionIdRef.current,
          }),
        });
        const tickData = await tickRes.json();
        if (tickRes.ok) {
          setMinutesUsed((m) => m + 1);
        } else if (tickData.endSession) {
          setError("Out of tokens — video ended");
          localStream?.getTracks().forEach((t) => t.stop());
        }
      }, 60_000);
    }

    async function initWebRTC() {
      try {
        await startSession();
        setStatus("Requesting camera & microphone...");
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream!));

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setConnected(true);
          setStatus("Connected — signaling stub (add Supabase Realtime for P2P)");
        };

        pc.oniceconnectionstatechange = () => {
          setStatus(`ICE: ${pc.iceConnectionState}`);
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        setStatus("Ready — WebRTC stub active");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not access camera/microphone");
      }
    }

    initWebRTC();

    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
      if (billingIntervalRef.current) clearInterval(billingIntervalRef.current);
      if (sessionIdRef.current) {
        fetch("/api/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            action: "end",
            sessionId: sessionIdRef.current,
          }),
        });
      }
      recognitionRef.current?.stop();
    };
  }, [conversationId]);

  useEffect(() => {
    if (!subtitlesOn) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      if (event.results[event.results.length - 1].isFinal) {
        translateSubtitle(transcript);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [subtitlesOn, translateSubtitle]);

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Video with {partnerName}</h1>
          <p className="text-xs text-gray-500 sm:text-sm">{status}</p>
          <p className="text-xs text-amber-600">
            {minutesUsed} min · {minutesUsed * VIDEO_COST_PER_MINUTE} tokens used
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSubtitlesOn(!subtitlesOn)}
            className={`rounded-xl px-4 py-2 text-sm ${
              subtitlesOn ? "bg-blue-600 text-white" : "border border-gray-300"
            }`}
          >
            {subtitlesOn ? "Subtitles On" : "Subtitles Off"}
          </button>
          <Link
            href={`/chat/${conversationId}`}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Chat
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gray-900 sm:rounded-3xl">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full object-cover"
          />
          <p className="bg-gray-800 px-3 py-1.5 text-xs text-gray-300 sm:px-4 sm:py-2 sm:text-sm">
            You
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gray-900 sm:rounded-3xl">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="aspect-video w-full object-cover"
          />
          <p className="bg-gray-800 px-3 py-1.5 text-xs text-gray-300 sm:px-4 sm:py-2 sm:text-sm">
            {partnerName} {connected ? "🟢" : "⏳"}
          </p>
          {subtitlesOn && translatedSubtitle && (
            <div className="absolute bottom-10 left-2 right-2 rounded-lg bg-black/70 px-3 py-2 text-center text-sm text-white">
              <p className="text-xs text-gray-300">{subtitle}</p>
              <p>🌐 {translatedSubtitle}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 sm:text-sm">
        <strong>Live subtitles:</strong> Uses browser speech recognition + Gemini/DeepL translation.
        WebRTC P2P needs a signaling server for real remote video.
      </div>
    </div>
  );
}

// Web Speech API types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: { isFinal: boolean; [0]: { transcript: string } };
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
