const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export default function App() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
          ezyCollect
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Docker-first monorepo starter
        </h1>
        <p className="mt-3 text-slate-300">
          Vite + React + TypeScript + Tailwind frontend served by Nginx.
        </p>
        <div className="mt-6 rounded-lg border border-cyan-300/20 bg-cyan-400/5 p-4">
          <p className="text-sm text-slate-200">API base URL</p>
          <code className="mt-1 block text-sm text-cyan-200">{apiBaseUrl}</code>
        </div>
        <a
          className="mt-6 inline-flex rounded-md bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
          href={`${apiBaseUrl}/api/health`}
          target="_blank"
          rel="noreferrer"
        >
          Check backend health
        </a>
      </div>
    </main>
  );
}
