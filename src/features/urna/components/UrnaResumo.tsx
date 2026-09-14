import type { Voto } from "@/domain/eleicao";

export function UrnaResumo({ votos, onReiniciar }: { votos: Voto[]; onReiniciar: () => void }) {
  return (
    <>
      <div role="status" className="rounded-lg border-4 border-primary bg-card p-6 text-center">
        <p className="text-4xl font-extrabold tracking-tight">FIM</p>
        <p className="mt-2 text-base text-muted-foreground">Simulação concluída.</p>
      </div>

      <h2 className="mt-6 text-lg font-bold">Resumo dos votos</h2>
      <ul className="mt-2 space-y-2">
        {votos.map((v, i) => (
          <li key={i} className="rounded-md border-2 border-border bg-card p-3">
            <p className="text-sm font-semibold text-muted-foreground">{v.rotulo}</p>
            <p className="text-base font-bold">
              {v.tipo === "candidato" ? `${v.codigo} — ${v.nome}` : v.nome}
            </p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onReiniciar}
        className="mt-6 w-full rounded-md bg-primary px-4 py-4 text-lg font-extrabold text-primary-foreground"
      >
        Votar novamente
      </button>
    </>
  );
}
