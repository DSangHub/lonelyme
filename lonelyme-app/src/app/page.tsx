import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
              L
            </div>
            <span className="text-xl font-semibold text-blue-600">LonelyMe</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-2xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-blue-900 to-blue-500 py-24 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
            End loneliness.<br />
            <span className="text-blue-200">Connect safely with the world.</span>
          </h1>
          <p className="mb-10 text-xl text-blue-100">
            Real conversations with global friends. Real-time translation. AI-powered safety.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-3xl bg-white px-8 py-4 text-lg font-semibold text-blue-700 hover:bg-blue-50"
          >
            Join LonelyMe — 50 Free Tokens
          </Link>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-4xl gap-8 px-6 md:grid-cols-3">
          {[
            { icon: "🌍", title: "Global Matching", desc: "Meet friends from other countries" },
            { icon: "🌐", title: "Live Translation", desc: "Gemini / DeepL powered chat" },
            { icon: "🛡️", title: "AI Safety", desc: "Proactive moderation on every message" },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl bg-white p-8 shadow-sm">
              <div className="mb-4 text-3xl">{f.icon}</div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
