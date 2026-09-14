import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { QrScanner } from "@/components/QrScanner";
import { listaService } from "@/features/listas/services/listaService";

export const Route = createFileRoute("/importar")({
  head: () => ({
    meta: [
      { title: "Importar lista por QR Code — Colinha Eleitoral" },
      {
        name: "description",
        content:
          "Leia o QR Code de uma colinha ou cole o JSON para importar a lista de candidatos no seu aparelho.",
      },
      { property: "og:title", content: "Importar lista por QR Code — Colinha Eleitoral" },
      {
        property: "og:description",
        content: "Leia o QR Code de uma colinha ou cole o JSON para importar a lista.",
      },
    ],
  }),
  component: Importar,
});

function Importar() {
  const navigate = useNavigate();
  const [camera, setCamera] = useState(false);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");

  const importar = useCallback(
    (bruto: string) => {
      try {
        const lista = listaService.importarDeTexto(bruto);
        navigate({ to: "/lista/$id", params: { id: lista.id } });
      } catch (e) {
        setCamera(false);
        setErro(e instanceof Error ? e.message : "Não foi possível importar.");
      }
    },
    [navigate],
  );

  const aoErroCamera = useCallback((m: string) => {
    setCamera(false);
    setErro(m);
  }, []);

  return (
    <AppShell
      titulo="Importar lista"
      descricao="Por QR Code ou colando o JSON"
      voltar={
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded text-sm font-semibold text-primary-foreground/85 underline underline-offset-4"
        >
          <span aria-hidden="true">←</span> Voltar
        </Link>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto scroll-permitido space-y-4 pr-1 pb-4">
        <section className="rounded-lg border-2 border-border bg-card p-4">
          <h2 className="text-base font-bold">1. Ler QR Code</h2>
          <button
            type="button"
            onClick={() => {
              setErro("");
              setCamera((v) => !v);
            }}
            aria-pressed={camera}
            className="mt-3 w-full rounded-md bg-primary px-4 py-3 text-base font-bold text-primary-foreground"
          >
            {camera ? "Parar câmera" : "Abrir câmera"}
          </button>
          <QrScanner ativo={camera} onLeitura={importar} onErro={aoErroCamera} />
        </section>

        <section className="rounded-lg border-2 border-border bg-card p-4">
          <h2 className="text-base font-bold">2. Ou colar o JSON</h2>
          <label htmlFor="json-colado" className="mt-2 block text-sm text-muted-foreground">
            Use esta opção se a câmera não estiver disponível.
          </label>
          <textarea
            id="json-colado"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={5}
            spellCheck={false}
            placeholder='{"apelido":"Minha colinha","candidatos":[…]}'
            className="mt-2 w-full rounded-md border-2 border-input bg-background p-3 font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => {
              setErro("");
              importar(texto);
            }}
            className="mt-2 w-full rounded-md border-2 border-primary px-4 py-3 text-base font-bold text-primary"
          >
            Importar JSON colado
          </button>
        </section>

        {erro ? (
          <p aria-live="assertive">
            <span
              role="alert"
              className="block rounded-md border-2 border-destructive bg-destructive/10 p-3 text-sm font-semibold text-destructive"
            >
              {erro}
            </span>
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
