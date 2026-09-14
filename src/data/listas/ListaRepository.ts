import type { Lista } from "@/domain/eleicao";

export type CancelarInscricao = () => void;

/**
 * Contrato de persistência de listas.
 * A UI depende apenas desta interface (inversão de dependência),
 * permitindo trocar localStorage por outro backend sem tocar nas telas.
 */
export interface ListaRepository {
  listar(): Lista[];
  obter(id: string): Lista | undefined;
  salvar(lista: Lista): Lista;
  remover(id: string): void;
  limpar(): void;
  inscrever(ouvinte: () => void): CancelarInscricao;
}
