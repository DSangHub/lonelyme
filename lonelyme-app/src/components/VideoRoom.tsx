"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type VideoRoomProps = {
  conversationId: string;
  partnerName: string;
};

export function VideoRoom({ conversationId, partnerName }: VideoRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [status, setStatus] = useState("Initializing...");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function initWebRTC() {
      try {
        setStatus("Requesting camera & microphone...");
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream!);
        });

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setConnected(true);
          setStatus("Connected (stub — signaling server needed for real P2P)");
        };

        pc.oniceconnectionstatechange = () => {
          setStatus(`ICE: ${pc.iceConnectionState}`);
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            // In production: send via Supabase Realtime / WebSocket signaling
            console.log("[WebRTC stub] ICE candidate:", event.candidate);
          }
        };

        setStatus("Ready — waiting for peer (signaling stub)");

        // Stub: create offer locally to demonstrate WebRTC flow
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("[WebRTC stub] Local offer created:", offer.type);

        // Simulate signaling delay
        setTimeout(() => {
          setStatus("Peer connection stub active. Add signaling server for real matches.");
        }, 1500);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not access camera/microphone"
        );
        setStatus("Failed");
      }
    }

    initWebRTC();

    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
    };
  }, [conversationId]);

  async function handleCreateOffer() {
    const pc = pcRef.current;
    if (!pc) return;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    setStatus("Offer created (copy to peer via signaling)");
    console.log("[WebRTC stub] Offer:", JSON.stringify(offer));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video with {partnerName}</h1>
          <p className="text-sm text-gray-500">{status}</p>
        </div>
        <Link
          href={`/chat/${conversationId}`}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back to Chat
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-gray-900">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full object-cover"
          />
          <p className="bg-gray-800 px-4 py-2 text-sm text-gray-300">You</p>
        </div>
        <div className="overflow-hidden rounded-3xl bg-gray-900">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="aspect-video w-full object-cover"
          />
          <p className="bg-gray-800 px-4 py-2 text-sm text-gray-300">
            {partnerName} {connected ? "🟢" : "⏳"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>WebRTC stub:</strong> Camera/mic work locally. Full peer-to-peer video requires a
        signaling server (e.g. Supabase Realtime) to exchange SDP offers/answers and ICE candidates
        between matched users.
      </div>

      <button
        onClick={handleCreateOffer}
        className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
      >
        Create Offer (Debug)
      </button>
    </div>
  );
}
