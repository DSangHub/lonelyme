export function SandboxBanner() {
  const isSandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true";
  if (!isSandbox) return null;

  return (
    <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950">
      🧪 Sandbox Mode — mock translation &amp; Stripe test. Magic links:{" "}
      <a
        href="http://127.0.0.1:54324"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-amber-900"
      >
        Inbucket
      </a>
    </div>
  );
}
