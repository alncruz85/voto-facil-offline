/**
 * Tipos e contratos do sistema de Monetização e Anúncios.
 * Segue os princípios de Inversão de Dependência e Segregação de Interfaces (SOLID).
 */

export type AdPlacement = "banner_footer" | "banner_lista" | "interstitial_fim_votacao";

export type AdProviderType = "noop" | "admob" | "custom";

export interface AdServiceConfig {
  provider: AdProviderType;
  enabled: boolean;
  testMode?: boolean;
  bannerAdUnitId?: string;
  interstitialAdUnitId?: string;
}

/**
 * Contrato para serviços de exibição de anúncios.
 * Permite alternar entre NoOp (sem anúncios na v1), AdMob ou outros parceiros sem mexer na UI.
 */
export interface IAdService {
  readonly isReady: boolean;
  readonly isEnabled: boolean;

  inicializar(config?: Partial<AdServiceConfig>): Promise<void>;
  exibirBanner(posicao?: AdPlacement): Promise<boolean>;
  ocultarBanner(): Promise<boolean>;
  exibirIntersticial(): Promise<boolean>;
}

export type SubscriptionStatus = "free" | "premium_monthly" | "premium_lifetime";

export interface PremiumFeature {
  id: string;
  nome: string;
  descricao: string;
}

/**
 * Contrato para verificação de status e compras no app (IAP).
 */
export interface IPremiumService {
  isPremium(): boolean;
  obterStatus(): SubscriptionStatus;
  restaurarCompras(): Promise<boolean>;
  comprarRecurso(featureId: string): Promise<boolean>;
}
