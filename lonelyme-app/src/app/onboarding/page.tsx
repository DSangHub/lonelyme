export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/OnboardingForm";
import Link from "next/link";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const needsOnboarding =
    !profile?.interests?.length || !profile?.languages?.length;

  if (!needsOnboarding && profile) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            L
          </div>
          <span className="font-semibold text-blue-600">LonelyMe</span>
        </Link>
      </div>
      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Set up your profile</h1>
        <p className="mb-8 text-sm text-gray-600">
          Help us suggest great platonic friends based on your languages, interests, and schedule.
        </p>
        <OnboardingForm initial={profile ?? undefined} />
      </main>
    </div>
  );
}
