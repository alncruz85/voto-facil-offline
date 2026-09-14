import type { ReactNode } from "react";
import { AdBannerSlot } from "@/core/monetization";

export function AppShell({
  titulo,
  descricao,
  voltar,
  acao,
  subHeader,
  children,
}: {
  titulo: string;
  descricao?: string;
  voltar?: ReactNode;
  acao?: ReactNode;
  subHeader?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col bg-background text-foreground">
      <header className="shrink-0 border-b-4 border-primary bg-primary text-primary-foreground shadow-sm">
        <div className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:py-4">
          <div className="min-w-0">
            {voltar ? <div className="mb-0.5">{voltar}</div> : null}
            <h1 className="truncate text-xl sm:text-2xl font-extrabold">{titulo}</h1>
            {descricao ? (
              <p className="mt-0.5 truncate text-xs sm:text-sm text-primary-foreground/85">
                {descricao}
              </p>
            ) : null}
          </div>
          {acao ? <div className="shrink-0">{acao}</div> : null}
        </div>
      </header>
      {subHeader ? <div className="shrink-0">{subHeader}</div> : null}
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col w-full max-w-2xl mx-auto px-4 py-3 sm:py-4">
        {children}
      </main>
      <footer className="shrink-0">
        <AdBannerSlot placement="banner_footer" />
      </footer>
    </div>
  );
}
