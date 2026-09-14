import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useLista } from "@/features/listas/hooks/useListas";
import { useUrna, type ModoUrna } from "@/features/urna/hooks/useUrna";
import { UrnaVisor } from "@/features/urna/components/UrnaVisor";
import { UrnaTeclado } from "@/features/urna/components/UrnaTeclado";
import { UrnaResumo } from "@/features/urna/components/UrnaResumo";

type UrnaSearch = {
  modo?: ModoUrna;
};

export const Route = createFileRoute("/urna/$id")({
  validateSearch: (search: Record<string, unknown>): UrnaSearch => ({
    modo: search.modo === "manual" ? "manual" : "preenchido",
  }),
  head: () => ({
    meta: [
      { title: "Urna eletrônica simulada — Voto Fácil" },
      {
        name: "description",
        content:
          "Treine seu voto em uma urna eletrônica simulada, com teclado numérico, CORRIGE, CONFIRMA e fluxo de cargos cadastrados na ordem oficial.",
      },
      { property: "og:title", content: "Urna eletrônica simulada — Voto Fácil" },
      {
        property: "og:description",
        content: "Teclado numérico, CORRIGE e CONFIRMA, com o fluxo de cargos cadastrados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UrnaPage,
});

function UrnaPage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const modo = search.modo ?? "preenchido";
  const { pronto, lista } = useLista(id);
  const urna = useUrna(lista, modo);

  if (!pronto) return <AppShell titulo="Carregando…">{null}</AppShell>;
  if (!lista) {
    return (
      <AppShell titulo="Eleição não encontrada">
        <Link to="/" className="font-bold text-primary underline">
          Voltar ao início
        </Link>
      </AppShell>
    );
  }

  const sair = (
    <Link
      to="/"
      className="inline-flex items-center gap-1 rounded text-sm font-semibold underline underline-offset-4"
    >
      <span aria-hidden="true">←</span> Sair da urna
    </Link>
  );

  if (urna.terminou || !urna.etapaAtual || !urna.avaliacao) {
    return (
      <AppShell titulo="FIM" descricao={lista.apelido} voltar={sair}>
        <div className="flex-1 min-h-0 overflow-y-auto scroll-permitido pr-1">
          <UrnaResumo votos={urna.votos} onReiniciar={urna.reiniciar} />
        </div>
      </AppShell>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col bg-urna-shell text-urna-shell-foreground">
      <header className="shrink-0 mx-auto flex max-w-5xl w-full items-center justify-between gap-3 px-4 py-2 sm:py-3">
        {sair}
        <div className="text-right">
          <p className="truncate text-sm font-extrabold text-urna-shell-foreground">
            {lista.apelido}
          </p>
          <p className="text-xs text-urna-shell-foreground/75 font-semibold">
            {modo === "manual" ? "Treino Livre" : "Preenchimento Automático"} · etapa{" "}
            {urna.indiceEtapa + 1} de {urna.etapas.length}
          </p>
        </div>
      </header>

      <div role="note" className="shrink-0 mx-auto max-w-5xl w-full px-4 pb-1 landscape:hidden">
        <p className="rounded-md border-2 border-corrige bg-corrige px-3 py-1.5 text-xs sm:text-sm font-bold text-corrige-foreground">
          <span aria-hidden="true">↻ </span>
          Gire o celular para o modo paisagem para a experiência idêntica à urna real.
        </p>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto scroll-permitido mx-auto max-w-5xl w-full px-3 pb-3 flex flex-col justify-center">
        <div className="rounded-xl border-4 border-black/60 bg-urna-shell p-2.5 sm:p-3 shadow-lg landscape:grid landscape:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] landscape:gap-4">
          <UrnaVisor
            etapa={urna.etapaAtual}
            digitos={urna.digitos}
            branco={urna.branco}
            avaliacao={urna.avaliacao}
          />
          <UrnaTeclado
            onDigitar={urna.digitar}
            onBranco={urna.votarBranco}
            onCorrigir={urna.corrigir}
            onConfirmar={urna.confirmar}
            podeConfirmar={urna.avaliacao.podeConfirmar}
          />
        </div>
      </main>
    </div>
  );
}
