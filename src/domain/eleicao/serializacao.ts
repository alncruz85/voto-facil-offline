import { ehCargo, type Cargo } from "./cargos";
import { novoId } from "./ids";
import type { Lista } from "./lista";

export type ListaExportada = {
  v: 1;
  apelido: string;
  candidatos: { nome: string; codigo: string; cargo: Cargo }[];
};

export function paraExportacao(lista: Lista): ListaExportada {
  return {
    v: 1,
    apelido: lista.apelido,
    candidatos: lista.candidatos.map(({ nome, codigo, cargo }) => ({ nome, codigo, cargo })),
  };
}

/** Valida e normaliza o JSON de uma lista vinda de QR Code / colagem. */
export function normalizarListaImportada(bruto: unknown): Lista {
  if (typeof bruto !== "object" || bruto === null) throw new Error("JSON inválido.");
  const obj = bruto as Record<string, unknown>;
  const apelido = typeof obj["apelido"] === "string" ? obj["apelido"].trim() : "";
  if (!apelido) throw new Error("A lista precisa de um apelido.");

  const brutos = Array.isArray(obj["candidatos"]) ? obj["candidatos"] : [];
  const candidatos = brutos.map((c) => {
    const item = (c ?? {}) as Record<string, unknown>;
    const nome = typeof item["nome"] === "string" ? item["nome"].trim() : "";
    const codigo = typeof item["codigo"] === "string" ? item["codigo"].replace(/\D/g, "") : "";
    const cargo = ehCargo(item["cargo"]) ? item["cargo"] : null;
    if (!nome || !codigo || !cargo) throw new Error("Candidato com dados incompletos.");
    return { id: novoId(), nome, codigo, cargo };
  });

  const agora = new Date().toISOString();
  return { id: novoId(), apelido, criadaEm: agora, atualizadaEm: agora, candidatos };
}

/** Interpreta um texto (QR Code ou colagem) como lista importável. */
export function lerListaDeTexto(texto: string): Lista {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    throw new Error("O conteúdo lido não é um JSON válido.");
  }
  return normalizarListaImportada(bruto);
}
