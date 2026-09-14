import { useCallback, useEffect, useMemo, useState } from "react";
import {
  avaliarVoto,
  etapasDaLista,
  registrarVoto,
  DIGITOS_POR_CARGO,
  type AvaliacaoVoto,
  type Etapa,
  type Lista,
  type Voto,
} from "@/domain/eleicao";

export type ModoUrna = "preenchido" | "manual";

export type EstadoUrna = {
  etapas: Etapa[];
  indiceEtapa: number;
  etapaAtual: Etapa | null;
  digitos: string;
  branco: boolean;
  votos: Voto[];
  terminou: boolean;
  avaliacao: AvaliacaoVoto | null;
  modo: ModoUrna;
};

export type AcoesUrna = {
  digitar: (n: string) => void;
  votarBranco: () => void;
  corrigir: () => void;
  confirmar: () => void;
  reiniciar: () => void;
};

/**
 * Obtém o código do candidato cadastrado na lista para preenchimento automático na urna.
 */
function obterCodigoCandidato(
  lista: Lista | undefined,
  etapa: Etapa | null,
  votosAtuais: Voto[],
  etapas: Etapa[],
): string {
  if (!lista || !etapa) return "";
  const total = DIGITOS_POR_CARGO[etapa.cargo];
  const codigosJaUsados = votosAtuais
    .filter((v, i) => v.tipo === "candidato" && etapas[i]?.cargo === etapa.cargo)
    .map((v) => v.codigo);

  if (etapa.cargo === "Senador") {
    const senadores = lista.candidatos.filter((c) => c.cargo === "Senador");
    if (etapa.vaga === 2) {
      const s2 = senadores.find((c) => !codigosJaUsados.includes(c.codigo));
      return s2 ? s2.codigo.slice(0, total) : "";
    }
    const s1 = senadores.find((c) => !codigosJaUsados.includes(c.codigo)) ?? senadores[0];
    return s1 ? s1.codigo.slice(0, total) : "";
  }

  const cand =
    lista.candidatos.find((c) => c.cargo === etapa.cargo && !codigosJaUsados.includes(c.codigo)) ??
    lista.candidatos.find((c) => c.cargo === etapa.cargo);

  return cand ? cand.codigo.slice(0, total) : "";
}

/** Máquina de estados da urna: separa o fluxo de votação da apresentação. */
export function useUrna(
  lista: Lista | undefined,
  modo: ModoUrna = "preenchido",
): EstadoUrna & AcoesUrna {
  const etapas = useMemo(() => (lista ? etapasDaLista(lista) : []), [lista]);
  const [indiceEtapa, setIndiceEtapa] = useState(0);
  const [votos, setVotos] = useState<Voto[]>([]);
  const [branco, setBranco] = useState(false);

  const terminou = indiceEtapa >= etapas.length;
  const etapaAtual = terminou ? null : (etapas[indiceEtapa] ?? null);

  // Inicializa com o código pré-preenchido apenas no modo "preenchido"
  const [digitos, setDigitos] = useState<string>(() => {
    if (modo === "manual") return "";
    const etapaInicial = etapas[0] ?? null;
    return obterCodigoCandidato(lista, etapaInicial, [], etapas);
  });

  // Atualiza os dígitos ao avançar de etapa
  useEffect(() => {
    if (lista && etapaAtual && !terminou) {
      if (modo === "preenchido") {
        const preenchido = obterCodigoCandidato(lista, etapaAtual, votos, etapas);
        setDigitos(preenchido);
      } else {
        setDigitos("");
      }
      setBranco(false);
    }
  }, [indiceEtapa, etapaAtual, terminou, votos, etapas, lista, modo]);

  const codigosJaVotados = useMemo(
    () =>
      votos
        .filter((v, i) => v.tipo === "candidato" && etapas[i]?.cargo === etapaAtual?.cargo)
        .map((v) => v.codigo),
    [votos, etapas, etapaAtual],
  );

  const avaliacao = useMemo(
    () =>
      lista && etapaAtual
        ? avaliarVoto({ lista, etapa: etapaAtual, digitos, branco, codigosJaVotados })
        : null,
    [lista, etapaAtual, digitos, branco, codigosJaVotados],
  );

  const limpar = useCallback(() => {
    setDigitos("");
    setBranco(false);
  }, []);

  const digitar = useCallback(
    (n: string) => {
      if (!avaliacao || branco) return;
      setDigitos((atual) => (atual.length >= avaliacao.totalDigitos ? atual : atual + n));
    },
    [avaliacao, branco],
  );

  const votarBranco = useCallback(() => {
    setDigitos("");
    setBranco(true);
  }, []);

  const confirmar = useCallback(() => {
    if (!lista || !etapaAtual || !avaliacao?.podeConfirmar) return;
    const voto = registrarVoto({ lista, etapa: etapaAtual, digitos, branco, codigosJaVotados });
    setVotos((atuais) => [...atuais, voto]);
    limpar();
    setIndiceEtapa((i) => i + 1);
  }, [lista, etapaAtual, avaliacao, digitos, branco, codigosJaVotados, limpar]);

  const reiniciar = useCallback(() => {
    setIndiceEtapa(0);
    setVotos([]);
    limpar();
  }, [limpar]);

  return {
    etapas,
    indiceEtapa,
    etapaAtual,
    digitos,
    branco,
    votos,
    terminou,
    avaliacao,
    modo,
    digitar,
    votarBranco,
    corrigir: limpar,
    confirmar,
    reiniciar,
  };
}
