export const dynamic = "force-dynamic";

import { AuthForm } from "@/components/AuthForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-gray-100 bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            L
          </div>
          <span className="font-semibold text-blue-600">LonelyMe</span>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
