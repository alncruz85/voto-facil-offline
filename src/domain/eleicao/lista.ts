import { ORDEM_MUNICIPAL, type Cargo } from "./cargos";
import { novoId } from "./ids";

export type Candidato = {
  id: string;
  nome: string;
  codigo: string;
  cargo: Cargo;
};

/**
 * Entidade Eleição: representa um conjunto de candidatos concorrendo em uma eleição.
 */
export type Eleicao = {
  id: string;
  apelido: string;
  criadaEm: string;
  atualizadaEm: string;
  candidatos: Candidato[];
  isFicticia?: boolean;
};

// Mantém o alias de tipo Lista para compatibilidade com o domínio
export type Lista = Eleicao;

/** Etapa do fluxo de votação (um cargo pode ter mais de uma vaga, como Senador). */
export type Etapa = { cargo: Cargo; rotulo: string; vaga?: 1 | 2 };

export const ETAPAS_GERAIS: readonly Etapa[] = [
  { cargo: "Deputado Federal", rotulo: "Deputado Federal" },
  { cargo: "Deputado Estadual", rotulo: "Deputado Estadual (ou distrital, no caso do DF)" },
  { cargo: "Senador", rotulo: "Senador (1ª vaga)", vaga: 1 },
  { cargo: "Senador", rotulo: "Senador (2ª vaga)", vaga: 2 },
  { cargo: "Governador", rotulo: "Governador e Vice-Governador" },
  { cargo: "Presidente", rotulo: "Presidente e Vice-Presidente da República" },
];

export const ETAPAS_MUNICIPAIS: readonly Etapa[] = [
  { cargo: "Vereador", rotulo: "Vereador" },
  { cargo: "Prefeito", rotulo: "Prefeito e Vice-Prefeito" },
];

export const TODAS_AS_ETAPAS: readonly Etapa[] = [
  { cargo: "Deputado Federal", rotulo: "Deputado Federal" },
  { cargo: "Deputado Estadual", rotulo: "Deputado Estadual (ou distrital, no caso do DF)" },
  { cargo: "Senador", rotulo: "Senador (1ª vaga)", vaga: 1 },
  { cargo: "Senador", rotulo: "Senador (2ª vaga)", vaga: 2 },
  { cargo: "Governador", rotulo: "Governador e Vice-Governador" },
  { cargo: "Presidente", rotulo: "Presidente e Vice-Presidente da República" },
  { cargo: "Vereador", rotulo: "Vereador" },
  { cargo: "Prefeito", rotulo: "Prefeito e Vice-Prefeito" },
];

/**
 * Etapas do fluxo de votação na urna eletrônica.
 * A simulação reflete exclusivamente os cargos cadastrados para aquela eleição/simulação na ordem oficial.
 * Se a eleição não tiver candidatos cadastrados, utiliza a ordem padrão das eleições gerais.
 */
export function etapasDaLista(lista?: Lista): Etapa[] {
  if (!lista || lista.candidatos.length === 0) {
    return [...ETAPAS_GERAIS];
  }

  const senadores = lista.candidatos.filter((c) => c.cargo === "Senador");
  const cargosPresentes = new Set(lista.candidatos.map((c) => c.cargo));

  return TODAS_AS_ETAPAS.filter((etapa) => {
    if (!cargosPresentes.has(etapa.cargo)) return false;
    // Se só tem 1 senador cadastrado na lista, gera apenas 1 etapa de senador
    if (etapa.cargo === "Senador" && etapa.vaga === 2 && senadores.length < 2) {
      return false;
    }
    return true;
  });
}

/** Valida se o nome da eleição é único no conjunto de eleições. */
export function validarNomeEleicaoUnico(eleicoes: Lista[], nome: string, idAtual?: string): void {
  const normalizado = nome.trim().toLowerCase();
  if (!normalizado) throw new Error("O nome da eleição não pode estar vazio.");
  const duplicado = eleicoes.find(
    (e) => e.id !== idAtual && e.apelido.trim().toLowerCase() === normalizado,
  );
  if (duplicado) {
    throw new Error(`Já existe uma eleição cadastrada com o nome “${duplicado.apelido}”.`);
  }
}

/** Valida se o número do candidato é único dentro da eleição. */
export function validarNumeroCandidatoUnico(
  lista: Lista,
  codigo: string,
  idCandidatoAtual?: string,
): void {
  const normalizado = codigo.replace(/\D/g, "");
  if (!normalizado) throw new Error("O código do candidato não pode estar vazio.");
  const duplicado = lista.candidatos.find(
    (c) => c.id !== idCandidatoAtual && c.codigo === normalizado,
  );
  if (duplicado) {
    throw new Error(
      `O número ${normalizado} já está cadastrado para o candidato ${duplicado.nome} (${duplicado.cargo}) nesta eleição.`,
    );
  }
}

export function criarListaVazia(apelido: string): Lista {
  const agora = new Date().toISOString();
  return {
    id: novoId(),
    apelido: apelido.trim(),
    criadaEm: agora,
    atualizadaEm: agora,
    candidatos: [],
  };
}

export function criarCandidato(dados: Omit<Candidato, "id">): Candidato {
  return { id: novoId(), ...dados, codigo: dados.codigo.replace(/\D/g, "") };
}

export function adicionarCandidato(lista: Lista, dados: Omit<Candidato, "id">): Lista {
  validarNumeroCandidatoUnico(lista, dados.codigo);
  return { ...lista, candidatos: [...lista.candidatos, criarCandidato(dados)] };
}

export function atualizarCandidato(
  lista: Lista,
  candidatoId: string,
  dados: Omit<Candidato, "id">,
): Lista {
  validarNumeroCandidatoUnico(lista, dados.codigo, candidatoId);
  return {
    ...lista,
    candidatos: lista.candidatos.map((c) =>
      c.id === candidatoId ? { ...c, ...dados, codigo: dados.codigo.replace(/\D/g, "") } : c,
    ),
  };
}

export function removerCandidato(lista: Lista, candidatoId: string): Lista {
  return { ...lista, candidatos: lista.candidatos.filter((c) => c.id !== candidatoId) };
}

export function renomearLista(lista: Lista, apelido: string): Lista {
  return { ...lista, apelido: apelido.trim() };
}
