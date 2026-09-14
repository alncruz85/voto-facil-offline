const NUMEROS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

function TeclaNumero({ n, onClick }: { n: string; onClick: (n: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(n)}
      aria-label={`Número ${n}`}
      className="tabular min-h-14 rounded-md border-2 border-black/50 bg-urna-key text-2xl font-extrabold text-urna-key-foreground active:brightness-95"
    >
      {n}
    </button>
  );
}

export function UrnaTeclado({
  onDigitar,
  onBranco,
  onCorrigir,
  onConfirmar,
  podeConfirmar,
}: {
  onDigitar: (n: string) => void;
  onBranco: () => void;
  onCorrigir: () => void;
  onConfirmar: () => void;
  podeConfirmar: boolean;
}) {
  return (
    <section aria-label="Teclado da urna" className="mt-3 landscape:mt-0">
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Teclado numérico">
        {NUMEROS.map((n) => (
          <TeclaNumero key={n} n={n} onClick={onDigitar} />
        ))}
        <span aria-hidden="true" />
        <TeclaNumero n="0" onClick={onDigitar} />
        <span aria-hidden="true" />
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onBranco}
          className="min-h-14 rounded-md border-2 border-black/50 bg-urna-key px-1 text-sm font-extrabold uppercase text-urna-key-foreground active:brightness-95"
        >
          Branco
        </button>
        <button
          type="button"
          onClick={onCorrigir}
          className="min-h-14 rounded-md border-2 border-black/50 bg-corrige text-sm font-extrabold uppercase text-corrige-foreground active:brightness-95"
        >
          Corrige
        </button>
        <button
          type="button"
          onClick={onConfirmar}
          disabled={!podeConfirmar}
          className="min-h-14 rounded-md border-2 border-black/50 bg-confirma text-sm font-extrabold uppercase text-confirma-foreground disabled:opacity-40 active:brightness-95"
        >
          Confirma
        </button>
      </div>
    </section>
  );
}
