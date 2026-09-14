import { useEffect, useState } from "react";
import { Clock, Calendar } from "lucide-react";

// Data oficial do 1º Turno das Eleições Gerais de 2026: 04 de Outubro de 2026 às 08:00 (Horário de Brasília)
const DATA_ELEICOES_2026 = new Date("2026-10-04T08:00:00-03:00").getTime();

interface TempoRestante {
  totalMs: number;
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

function calcularTempoRestante(dataAlvoMs: number): TempoRestante {
  const agora = Date.now();
  const diferenca = dataAlvoMs - agora;

  if (diferenca <= 0) {
    return { totalMs: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 };
  }

  const segundos = Math.floor((diferenca / 1000) % 60);
  const minutos = Math.floor((diferenca / (1000 * 60)) % 60);
  const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));

  return { totalMs: diferenca, dias, horas, minutos, segundos };
}

export function ContadorEleicoes() {
  const [tempo, setTempo] = useState<TempoRestante>(() =>
    calcularTempoRestante(DATA_ELEICOES_2026),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTempo(calcularTempoRestante(DATA_ELEICOES_2026));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const jaPassou = tempo.totalMs <= 0;

  return (
    <section className="rounded-lg border-2 border-primary/30 bg-card p-3.5 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary animate-pulse" />
          <h3 className="text-sm font-extrabold text-foreground">
            Contagem Regressiva para as Eleições
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
          <Calendar className="h-3 w-3" /> 04/10/2026
        </span>
      </div>

      {jaPassou ? (
        <div className="text-center py-2">
          <p className="text-sm font-extrabold text-primary">
            🎉 As Eleições de 2026 estão acontecendo hoje!
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Não esqueça de levar um documento com foto e sua colinha offline no bolso!
          </p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-4 gap-2 text-center my-2">
            {/* Bloco Dias */}
            <div className="flex flex-col items-center justify-center rounded-md bg-muted/60 p-2 border border-border">
              <span className="text-xl sm:text-2xl font-black text-foreground tabular leading-none">
                {tempo.dias}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                Dias
              </span>
            </div>

            {/* Bloco Horas */}
            <div className="flex flex-col items-center justify-center rounded-md bg-muted/60 p-2 border border-border">
              <span className="text-xl sm:text-2xl font-black text-foreground tabular leading-none">
                {String(tempo.horas).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                Horas
              </span>
            </div>

            {/* Bloco Minutos */}
            <div className="flex flex-col items-center justify-center rounded-md bg-muted/60 p-2 border border-border">
              <span className="text-xl sm:text-2xl font-black text-foreground tabular leading-none">
                {String(tempo.minutos).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                Min
              </span>
            </div>

            {/* Bloco Segundos */}
            <div className="flex flex-col items-center justify-center rounded-md bg-primary/10 p-2 border border-primary/30">
              <span className="text-xl sm:text-2xl font-black text-primary tabular leading-none">
                {String(tempo.segundos).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider mt-1">
                Seg
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center mt-2">
            Falta pouco para o 1º turno das Eleições Gerais. Organize sua colinha e treine na urna!
          </p>
        </div>
      )}
    </section>
  );
}
