import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interests, languages, timezone, bio, display_name } = await request.json();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      interests: interests ?? [],
      languages: languages ?? ["English"],
      timezone: timezone ?? "UTC",
      bio: bio ?? "",
      display_name,
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
