import { DIGITOS_POR_CARGO } from "./cargos";
import type { Etapa, Lista } from "./lista";

export type TipoVoto = "candidato" | "branco" | "nulo";

export type Voto = {
  rotulo: string;
  tipo: TipoVoto;
  nome: string;
  codigo: string;
};

export type AvaliacaoVoto = {
  /** Quantidade de dígitos esperada para a etapa. */
  totalDigitos: number;
  /** Todos os dígitos foram informados. */
  completo: boolean;
  /** CONFIRMA pode ser acionado. */
  podeConfirmar: boolean;
  /** Candidato correspondente ao número digitado, se houver. */
  candidatoNome: string | null;
  /** Número corresponde a um candidato válido para esta etapa. */
  valido: boolean;
  /** Candidato já usado na 1ª vaga de Senador. */
  repetido: boolean;
  /** Texto principal do visor ("", nome, VOTO NULO, VOTO EM BRANCO). */
  situacao: string;
  /** Explicação do motivo do voto nulo, quando aplicável. */
  motivo: string | null;
};

export type EntradaVoto = {
  lista: Lista;
  etapa: Etapa;
  digitos: string;
  branco: boolean;
  /** Códigos já confirmados para o mesmo cargo em etapas anteriores. */
  codigosJaVotados: readonly string[];
};

/** Regra de negócio pura da apuração de um voto em andamento. */
export function avaliarVoto({
  lista,
  etapa,
  digitos,
  branco,
  codigosJaVotados,
}: EntradaVoto): AvaliacaoVoto {
  const totalDigitos = DIGITOS_POR_CARGO[etapa.cargo];
  const completo = digitos.length === totalDigitos;

  const encontrado = lista.candidatos.find(
    (c) =>
      c.cargo === etapa.cargo &&
      (c.codigo === digitos || c.codigo.startsWith(digitos) || digitos.startsWith(c.codigo)),
  );
  const repetido = Boolean(
    encontrado &&
    etapa.vaga === 2 &&
    codigosJaVotados.some(
      (votado) =>
        votado === encontrado.codigo || votado === digitos || encontrado.codigo.startsWith(votado),
    ),
  );
  const valido = Boolean(encontrado) && !repetido;

  const situacao = branco
    ? "VOTO EM BRANCO"
    : completo
      ? valido && encontrado
        ? encontrado.nome
        : "VOTO NULO"
      : "";

  const motivo =
    !branco && completo && !valido
      ? repetido
        ? "Este candidato já foi votado na 1ª vaga."
        : "Número não consta na sua lista para este cargo."
      : null;

  return {
    totalDigitos,
    completo,
    podeConfirmar: branco || completo,
    candidatoNome: encontrado?.nome ?? null,
    valido,
    repetido,
    situacao,
    motivo,
  };
}

/** Converte o estado atual em um registro definitivo de voto. */
export function registrarVoto(entrada: EntradaVoto): Voto {
  const avaliacao = avaliarVoto(entrada);
  if (entrada.branco) {
    return { rotulo: entrada.etapa.rotulo, tipo: "branco", nome: "VOTO EM BRANCO", codigo: "" };
  }
  if (avaliacao.valido && avaliacao.candidatoNome) {
    return {
      rotulo: entrada.etapa.rotulo,
      tipo: "candidato",
      nome: avaliacao.candidatoNome,
      codigo: entrada.digitos,
    };
  }
  return { rotulo: entrada.etapa.rotulo, tipo: "nulo", nome: "VOTO NULO", codigo: entrada.digitos };
}
