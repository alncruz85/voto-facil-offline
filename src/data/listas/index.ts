import { LocalStorageListaRepository } from "./LocalStorageListaRepository";
import type { ListaRepository } from "./ListaRepository";

/** Ponto único de composição: troque aqui para usar outra persistência. */
export const listaRepository: ListaRepository = new LocalStorageListaRepository();

export type { ListaRepository, CancelarInscricao } from "./ListaRepository";
export { LocalStorageListaRepository } from "./LocalStorageListaRepository";
