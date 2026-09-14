import { useState } from "react";
import { QrCodeView } from "@/components/QrCodeView";

export function CompartilharLista({ apelido, json }: { apelido: string; json: string }) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <section className="mt-8 rounded-lg border-2 border-border bg-card p-4">
      <h2 className="text-base font-bold">Compartilhar por QR Code</h2>
      <button
        type="button"
        onClick={() => setMostrar((v) => !v)}
        aria-expanded={mostrar}
        className="mt-3 w-full rounded-md border-2 border-primary px-4 py-3 text-base font-bold text-primary"
      >
        {mostrar ? "Ocultar QR Code" : "Gerar QR Code da lista"}
      </button>
      {mostrar ? (
        <div className="mt-3">
          <QrCodeView valor={json} rotulo={`QR Code da lista ${apelido}`} />
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-bold">Ver JSON para copiar</summary>
            <textarea
              readOnly
              value={json}
              rows={5}
              aria-label="JSON da lista"
              className="mt-2 w-full rounded-md border-2 border-input bg-background p-2 font-mono text-xs"
            />
          </details>
        </div>
      ) : null}
    </section>
  );
}
