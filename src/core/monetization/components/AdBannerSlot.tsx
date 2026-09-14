import { useEffect, useState } from "react";
import { adService } from "../AdService";
import { premiumService } from "../PremiumService";
import type { AdPlacement } from "../types";

export function AdBannerSlot({
  placement = "banner_footer",
  className = "",
}: {
  placement?: AdPlacement;
  className?: string;
}) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Se for usuário premium ou anúncios estiverem desabilitados, não renderiza slot
    if (premiumService.isPremium() || !adService.isEnabled) {
      setVisivel(false);
      return;
    }

    adService.exibirBanner(placement).then((ok) => {
      setVisivel(ok && adService.isEnabled);
    });

    return () => {
      adService.ocultarBanner();
    };
  }, [placement]);

  if (!visivel) return null;

  return (
    <div
      className={`w-full min-h-[50px] flex items-center justify-center bg-muted/40 text-xs text-muted-foreground border-t border-border ${className}`}
      aria-hidden="true"
    >
      <span className="sr-only">Espaço reservado para anúncio</span>
    </div>
  );
}
