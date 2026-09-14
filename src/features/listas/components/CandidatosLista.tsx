import type { Candidato } from "@/domain/eleicao";

export function CandidatosLista({
  candidatos,
  onEditar,
  onExcluir,
}: {
  candidatos: Candidato[];
  onEditar: (c: Candidato) => void;
  onExcluir: (c: Candidato) => void;
}) {
  if (candidatos.length === 0) {
    return (
      <p className="mt-2 rounded-md border-2 border-dashed border-border p-4 text-sm text-muted-foreground">
        Nenhum candidato cadastrado.
      </p>
    );
  }

  return (
    <ul className="mt-3 space-y-2">
      {candidatos.map((c) => (
        <li
          key={c.id}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border-2 border-border bg-card p-3"
        >
          <div className="min-w-0">
            <p className="truncate text-base font-bold">{c.nome}</p>
            <p className="text-sm text-muted-foreground">
              <span className="tabular font-bold text-foreground">{c.codigo}</span> · {c.cargo}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onEditar(c)}
              className="rounded-md border-2 border-input px-3 py-2 text-sm font-bold"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onExcluir(c)}
              aria-label={`Excluir ${c.nome}`}
              className="rounded-md border-2 border-destructive px-3 py-2 text-sm font-bold text-destructive"
            >
              Excluir
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
