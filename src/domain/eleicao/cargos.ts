/**
 * Camada de domínio: regras eleitorais puras.
 * Não conhece React, armazenamento nem UI.
 */

export const CARGOS = [
  "Deputado Federal",
  "Deputado Estadual",
  "Senador",
  "Governador",
  "Presidente",
  "Vereador",
  "Prefeito",
] as const;

export type Cargo = (typeof CARGOS)[number];

/** Ordem oficial de votação nas eleições gerais (ex.: 2026). */
export const ORDEM_GERAL: readonly Cargo[] = [
  "Deputado Federal",
  "Deputado Estadual",
  "Senador",
  "Governador",
  "Presidente",
];

export const ORDEM_MUNICIPAL: readonly Cargo[] = ["Vereador", "Prefeito"];

/** Quantidade de dígitos oficial do código de votação por cargo. */
export const DIGITOS_POR_CARGO: Record<Cargo, number> = {
  "Deputado Federal": 4,
  "Deputado Estadual": 5,
  Senador: 3,
  Governador: 2,
  Presidente: 2,
  Vereador: 5,
  Prefeito: 2,
};

export function ehCargo(valor: unknown): valor is Cargo {
  return CARGOS.includes(valor as Cargo);
}

export type OpcaoCargo = {
  cargo: Cargo;
  rotulo: string;
  vaga?: 1 | 2;
};

/**
 * Retorna apenas os cargos que ainda não foram cadastrados na eleição.
 * Exceto Senador que permite 2 vagas ("Senador 1" e "Senador 2").
 */
export function obterCargosDisponiveis(
  eleicao: { candidatos: { id: string; cargo: Cargo }[] } | undefined,
  candidatoEmEdicaoId?: string | null,
): OpcaoCargo[] {
  if (!eleicao) {
    return [
      { cargo: "Deputado Federal", rotulo: "Deputado Federal (4 dígitos)" },
      { cargo: "Deputado Estadual", rotulo: "Deputado Estadual (5 dígitos)" },
      { cargo: "Senador", rotulo: "Senador 1 (1ª vaga — 3 dígitos)", vaga: 1 },
      { cargo: "Senador", rotulo: "Senador 2 (2ª vaga — 3 dígitos)", vaga: 2 },
      { cargo: "Governador", rotulo: "Governador e Vice-Governador (2 dígitos)" },
      { cargo: "Presidente", rotulo: "Presidente e Vice-Presidente da República (2 dígitos)" },
      { cargo: "Vereador", rotulo: "Vereador (5 dígitos)" },
      { cargo: "Prefeito", rotulo: "Prefeito e Vice-Prefeito (2 dígitos)" },
    ];
  }

  const outros = eleicao.candidatos.filter((c) => c.id !== candidatoEmEdicaoId);
  const contagem = outros.reduce<Record<string, number>>((acc, c) => {
    acc[c.cargo] = (acc[c.cargo] ?? 0) + 1;
    return acc;
  }, {});

  const opcoes: OpcaoCargo[] = [];

  if ((contagem["Deputado Federal"] ?? 0) < 1) {
    opcoes.push({ cargo: "Deputado Federal", rotulo: "Deputado Federal (4 dígitos)" });
  }

  if ((contagem["Deputado Estadual"] ?? 0) < 1) {
    opcoes.push({ cargo: "Deputado Estadual", rotulo: "Deputado Estadual (5 dígitos)" });
  }

  const qtdSenadores = contagem["Senador"] ?? 0;
  if (qtdSenadores === 0) {
    opcoes.push({ cargo: "Senador", rotulo: "Senador 1 (1ª vaga — 3 dígitos)", vaga: 1 });
  } else if (qtdSenadores === 1) {
    opcoes.push({ cargo: "Senador", rotulo: "Senador 2 (2ª vaga — 3 dígitos)", vaga: 2 });
  }

  if ((contagem["Governador"] ?? 0) < 1) {
    opcoes.push({ cargo: "Governador", rotulo: "Governador e Vice-Governador (2 dígitos)" });
  }

  if ((contagem["Presidente"] ?? 0) < 1) {
    opcoes.push({
      cargo: "Presidente",
      rotulo: "Presidente e Vice-Presidente da República (2 dígitos)",
    });
  }

  if ((contagem["Vereador"] ?? 0) < 1) {
    opcoes.push({ cargo: "Vereador", rotulo: "Vereador (5 dígitos)" });
  }

  if ((contagem["Prefeito"] ?? 0) < 1) {
    opcoes.push({ cargo: "Prefeito", rotulo: "Prefeito e Vice-Prefeito (2 dígitos)" });
  }

  return opcoes;
}
