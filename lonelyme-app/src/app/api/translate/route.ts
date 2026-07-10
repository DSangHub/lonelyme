import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { translateText } from "@/lib/translation";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, targetLanguage, sourceLanguage } = await request.json();

  if (!text || !targetLanguage) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const translated = await translateText(text, targetLanguage, sourceLanguage);
  return NextResponse.json({ translated });
}
