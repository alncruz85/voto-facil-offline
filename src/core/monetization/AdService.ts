import type { AdPlacement, AdServiceConfig, IAdService } from "./types";

/**
 * Implementação No-Op (Padrão Null Object / Strategy).
 * Garante que a aplicação funcione 100% offline, limpa e sem interferências de anúncios na versão inicial,
 * ao mesmo tempo que mantém a arquitetura pronta para ativação do AdMob na v2.
 */
export class NoOpAdService implements IAdService {
  public isReady = true;
  public isEnabled = false;

  async inicializar(_config?: Partial<AdServiceConfig>): Promise<void> {
    this.isReady = true;
    this.isEnabled = false;
  }

  async exibirBanner(_posicao?: AdPlacement): Promise<boolean> {
    // No-op na versão vigente: não quebra e não renderiza nada intrusivo
    return true;
  }

  async ocultarBanner(): Promise<boolean> {
    return true;
  }

  async exibirIntersticial(): Promise<boolean> {
    // No-op na versão vigente
    return true;
  }
}

/**
 * Factory para obter a instância configurada de anúncios.
 */
class AdServiceManager {
  private static instance: IAdService;

  public static getInstance(): IAdService {
    if (!AdServiceManager.instance) {
      AdServiceManager.instance = new NoOpAdService();
    }
    return AdServiceManager.instance;
  }

  public static setService(service: IAdService): void {
    AdServiceManager.instance = service;
  }
}

export const adService: IAdService = AdServiceManager.getInstance();
