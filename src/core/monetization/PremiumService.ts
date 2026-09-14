import type { IPremiumService, SubscriptionStatus } from "./types";

const LOCAL_PREMIUM_KEY = "voto_facil_premium_status";

export class LocalPremiumService implements IPremiumService {
  isPremium(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(LOCAL_PREMIUM_KEY) === "premium";
  }

  obterStatus(): SubscriptionStatus {
    return this.isPremium() ? "premium_lifetime" : "free";
  }

  async restaurarCompras(): Promise<boolean> {
    // Pronto para integrar com Google Play Billing na próxima versão
    return this.isPremium();
  }

  async comprarRecurso(_featureId: string): Promise<boolean> {
    // Pronto para integrar com Google Play Billing na próxima versão
    return true;
  }
}

export const premiumService: IPremiumService = new LocalPremiumService();
