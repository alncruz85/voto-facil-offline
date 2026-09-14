import type { AvaliacaoVoto, Etapa } from "@/domain/eleicao";

export function UrnaVisor({
  etapa,
  digitos,
  branco,
  avaliacao,
}: {
  etapa: Etapa;
  digitos: string;
  branco: boolean;
  avaliacao: AvaliacaoVoto;
}) {
  const { totalDigitos, situacao, valido, motivo, podeConfirmar } = avaliacao;

  return (
    <section
      aria-label="Visor da urna"
      className="rounded-lg border-2 border-black/50 bg-urna-screen p-4 text-urna-screen-foreground"
    >
      <h1 className="text-sm font-bold uppercase tracking-widest text-urna-screen-foreground/70">
        Seu voto para
      </h1>
      <p className="text-xl font-extrabold uppercase leading-tight">{etapa.rotulo}</p>

      <div className="mt-4 flex gap-2" aria-hidden="true">
        {Array.from({ length: totalDigitos }).map((_, i) => (
          <span
            key={i}
            className={`tabular flex h-12 flex-1 items-center justify-center rounded border-2 text-2xl font-extrabold ${
              digitos[i]
                ? "border-urna-screen-foreground bg-white text-urna-screen-foreground shadow-sm"
                : "border-urna-screen-foreground/30 bg-urna-screen text-urna-screen-foreground/30"
            }`}
          >
            {branco ? "" : (digitos[i] ?? "")}
          </span>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {branco
          ? "Voto em branco selecionado."
          : `Número digitado: ${digitos.split("").join(" ") || "nenhum"}. ${situacao}`}
      </p>

      <div className="mt-4 min-h-20 rounded-md border-2 border-urna-screen-foreground/20 bg-urna-screen p-3">
        {situacao ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-urna-screen-foreground/70">
                {valido && !branco ? "Nome do Candidato" : "Atenção"}
              </p>
              {valido && !branco ? (
                <span className="rounded bg-black/10 px-2 py-0.5 text-[11px] font-bold text-urna-screen-foreground/80">
                  Pré-preenchido da colinha
                </span>
              ) : null}
            </div>
            <p
              className={`mt-0.5 text-xl font-extrabold ${
                branco || !valido ? "text-destructive" : "text-urna-screen-foreground"
              }`}
            >
              {situacao}
            </p>
            {motivo ? (
              <p className="mt-1 text-sm text-urna-screen-foreground/70">{motivo}</p>
            ) : null}
          </>
        ) : (
          <p className="text-base text-urna-screen-foreground/70">
            Digite o número do seu candidato ou use o teclado da urna.
          </p>
        )}
      </div>

      <p className="mt-3 text-sm font-bold">
        {podeConfirmar
          ? "Aperte CONFIRMA para confirmar este voto ou CORRIGE para recomeçar."
          : `Digite ${totalDigitos} dígito${totalDigitos > 1 ? "s" : ""}.`}
      </p>
    </section>
  );
}
