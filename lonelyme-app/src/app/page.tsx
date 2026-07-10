import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
              L
            </div>
            <span className="text-xl font-semibold text-blue-600">LonelyMe</span>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <Link
              href="/login"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 sm:px-4"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:px-6 sm:py-2.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-blue-900 to-blue-500 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:mb-6 sm:text-5xl md:text-6xl">
            End loneliness.<br />
            <span className="text-blue-200">Platonic friends worldwide.</span>
          </h1>
          <p className="mb-8 text-lg text-blue-100 sm:mb-10 sm:text-xl">
            Magic-link sign in. AI-matched friends. Real-time translation. Wellness tracking.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-3xl bg-white px-6 py-4 text-base font-semibold text-blue-700 hover:bg-blue-50 sm:px-8 sm:text-lg"
          >
            Join Free — 50 Tokens
          </Link>
        </div>
      </section>

      <section className="py-12 sm:py-20">
        <div className="mx-auto grid max-w-4xl gap-4 px-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-4 md:px-6">
          {[
            { icon: "✉️", title: "Magic Link Auth", desc: "No passwords — just email" },
            { icon: "🌍", title: "AI Matching", desc: "Languages, interests, time zones" },
            { icon: "🌐", title: "Live Translation", desc: "Chat & video subtitles" },
            { icon: "💚", title: "Wellness", desc: "Mood check-ins & connection stats" },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
              <div className="mb-3 text-2xl sm:text-3xl">{f.icon}</div>
              <h3 className="mb-1 text-base font-semibold sm:text-lg">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
