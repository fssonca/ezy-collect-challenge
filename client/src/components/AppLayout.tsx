import type { PropsWithChildren } from "react";
import { PageContainer } from "./PageContainer";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-purple-300 bg-purple-700 text-white">
        <PageContainer>
          <div className="flex h-16 items-center">
            <span className="text-sm font-semibold tracking-[0.16em]">LOGO</span>
          </div>
        </PageContainer>
      </header>

      <main>
        <PageContainer>{children}</PageContainer>
      </main>
    </div>
  );
}
