/** Marcadores simples do aparelho (não são dados de domínio). */
export const marcadoresLocais = {
  ativo(chave: string): boolean {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(chave) === "1";
  },
  ativar(chave: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(chave, "1");
  },
};
