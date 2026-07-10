import { NextResponse } from "next/server";
import { moderateMessage } from "@/lib/moderation";

export async function POST(request: Request) {
  const { content } = await request.json();

  if (!content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const result = await moderateMessage(content);
  return NextResponse.json(result);
}
