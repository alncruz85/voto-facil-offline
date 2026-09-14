import type { Lista } from "@/domain/eleicao";
import type { CancelarInscricao, ListaRepository } from "./ListaRepository";

const CHAVE_PADRAO = "colinha-eleitoral:listas:v1";

/** Implementação offline baseada em localStorage, com tratamento de erros robusto, try/catch e logs para Logcat. */
export class LocalStorageListaRepository implements ListaRepository {
  private readonly chave: string;
  private readonly ouvintes = new Set<() => void>();

  constructor(chave: string = CHAVE_PADRAO) {
    this.chave = chave;
    console.log(`[LocalStorageListaRepository] Inicializado com chave: ${this.chave}`);
  }

  private ler(): Lista[] {
    if (typeof window === "undefined") {
      console.warn("[LocalStorageListaRepository] window não está definido (SSR/Node).");
      return [];
    }
    try {
      const bruto = window.localStorage.getItem(this.chave);
      if (!bruto) {
        console.log("[LocalStorageListaRepository] Nenhum dado encontrado no localStorage.");
        return [];
      }
      const dados: unknown = JSON.parse(bruto);
      if (!Array.isArray(dados)) {
        console.warn("[LocalStorageListaRepository] Dados corrompidos no localStorage (não é array). Resetando.");
        return [];
      }
      return dados as Lista[];
    } catch (err) {
      console.error("[LocalStorageListaRepository] Erro crítico ao ler/fazer parse do localStorage:", err);
      // Fallback seguro em caso de corrupção de JSON
      try {
        window.localStorage.removeItem(this.chave);
      } catch (e) {
        console.error("[LocalStorageListaRepository] Falha ao limpar chave corrompida:", e);
      }
      return [];
    }
  }

  private gravar(listas: Lista[]): void {
    if (typeof window === "undefined") return;
    try {
      const serialized = JSON.stringify(listas);
      window.localStorage.setItem(this.chave, serialized);
      console.log(`[LocalStorageListaRepository] Salvo com sucesso. Total de listas: ${listas.length}`);
      this.notificar();
    } catch (err) {
      console.error("[LocalStorageListaRepository] Erro crítico ao gravar no localStorage (possível quota excedida):", err);
      throw new Error("Não foi possível salvar os dados no armazenamento local do dispositivo.");
    }
  }

  private notificar(): void {
    try {
      this.ouvintes.forEach((o) => o());
    } catch (err) {
      console.error("[LocalStorageListaRepository] Erro nos ouvintes:", err);
    }
  }

  listar(): Lista[] {
    const listas = this.ler();
    return listas.sort((a, b) => (b.atualizadaEm || "").localeCompare(a.atualizadaEm || ""));
  }

  obter(id: string): Lista | undefined {
    return this.ler().find((l) => l.id === id);
  }

  salvar(lista: Lista): Lista {
    const listas = this.ler();
    const atualizada: Lista = { ...lista, atualizadaEm: new Date().toISOString() };
    const i = listas.findIndex((l) => l.id === lista.id);
    if (i >= 0) {
      listas[i] = atualizada;
    } else {
      listas.push(atualizada);
    }
    this.gravar(listas);
    return atualizada;
  }

  remover(id: string): void {
    const filtradas = this.ler().filter((l) => l.id !== id);
    this.gravar(filtradas);
  }

  limpar(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(this.chave);
      console.log("[LocalStorageListaRepository] Repositório limpo com sucesso.");
      this.notificar();
    } catch (err) {
      console.error("[LocalStorageListaRepository] Erro ao limpar repositório:", err);
    }
  }

  inscrever(ouvinte: () => void): CancelarInscricao {
    this.ouvintes.add(ouvinte);
    return () => {
      this.ouvintes.delete(ouvinte);
    };
  }
}
