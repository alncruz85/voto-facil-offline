import type { Lista } from "@/domain/eleicao";
import type { CancelarInscricao, ListaRepository } from "./ListaRepository";

const CHAVE_PADRAO = "colinha-eleitoral:listas:v1";

/** Implementação offline baseada em localStorage, com notificação de mudanças. */
export class LocalStorageListaRepository implements ListaRepository {
  private readonly chave: string;
  private readonly ouvintes = new Set<() => void>();

  constructor(chave: string = CHAVE_PADRAO) {
    this.chave = chave;
  }

  private ler(): Lista[] {
    if (typeof window === "undefined") return [];
    try {
      const bruto = window.localStorage.getItem(this.chave);
      if (!bruto) return [];
      const dados: unknown = JSON.parse(bruto);
      return Array.isArray(dados) ? (dados as Lista[]) : [];
    } catch {
      return [];
    }
  }

  private gravar(listas: Lista[]): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.chave, JSON.stringify(listas));
    this.notificar();
  }

  private notificar(): void {
    this.ouvintes.forEach((o) => o());
  }

  listar(): Lista[] {
    return this.ler().sort((a, b) => b.atualizadaEm.localeCompare(a.atualizadaEm));
  }

  obter(id: string): Lista | undefined {
    return this.ler().find((l) => l.id === id);
  }

  salvar(lista: Lista): Lista {
    const listas = this.ler();
    const atualizada: Lista = { ...lista, atualizadaEm: new Date().toISOString() };
    const i = listas.findIndex((l) => l.id === lista.id);
    if (i >= 0) listas[i] = atualizada;
    else listas.push(atualizada);
    this.gravar(listas);
    return atualizada;
  }

  remover(id: string): void {
    this.gravar(this.ler().filter((l) => l.id !== id));
  }

  limpar(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(this.chave);
    this.notificar();
  }

  inscrever(ouvinte: () => void): CancelarInscricao {
    this.ouvintes.add(ouvinte);
    return () => {
      this.ouvintes.delete(ouvinte);
    };
  }
}
