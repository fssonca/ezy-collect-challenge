import type { PropsWithChildren } from "react";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="bg-[var(--color-brand)] text-white">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center border-b border-white/15 px-4 sm:px-6">
          <span className="text-2xl font-bold tracking-[0.06em]">LOGO</span>
        </div>
      </header>

      <main className="flex-1 pb-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">{children}</div>
      </main>

      <div className="h-10 bg-[var(--color-brand)]" />
    </div>
  );
}
