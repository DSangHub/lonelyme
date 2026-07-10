"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type NavbarProps = {
  balance?: number;
};

const NAV_LINKS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/match", label: "Match", icon: "🌍" },
  { href: "/wellness", label: "Wellness", icon: "💚" },
  { href: "/tokens", label: "Tokens", icon: "🪙" },
];

export function Navbar({ balance }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white sm:h-10 sm:w-10 sm:text-xl">
              L
            </div>
            <span className="text-lg font-semibold text-blue-600 sm:text-xl">LonelyMe</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${
                  pathname === link.href ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {balance !== undefined && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:px-4 sm:py-1.5 sm:text-sm">
                {balance} 🪙
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="hidden text-sm text-gray-500 hover:text-gray-800 sm:block"
            >
              Sign out
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label="Menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-gray-100 px-4 py-3 md:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-xl px-4 py-3 text-sm font-medium ${
                  pathname === link.href ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="mt-2 w-full rounded-xl px-4 py-3 text-left text-sm text-gray-500"
            >
              Sign out
            </button>
          </div>
        )}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white md:hidden">
        <div className="flex justify-around py-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center px-3 py-1 text-xs ${
                pathname === link.href ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
