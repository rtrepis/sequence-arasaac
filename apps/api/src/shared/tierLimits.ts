// Límits de consum per pla
//
// Els valors viuen aquí i no al document d'usuari a propòsit: apujar el límit
// del pla gratuït ha de ser un desplegament, no una migració de tots els usuaris.
// El camp quotaOverride del User només serveix per a excepcions puntuals.
//
// El que de debò protegeix la factura és storageBytes: un compte buit no costa
// res, un que puja cinc-centes imatges a Cloudinary sí.

import type { QuotaLimits, UserTier } from "@sequence-arasaac/shared-types";

const MEGABYTE = 1024 * 1024;

export const TIER_LIMITS: Record<UserTier, QuotaLimits> = {
  free: {
    documents: 3,
    wordProfiles: 200,
    storageBytes: 50 * MEGABYTE,
  },
};

// Límits efectius d'un usuari: els del seu pla, amb les excepcions que tingui
export const resolveQuotaLimits = (
  tier: UserTier,
  override?: Partial<QuotaLimits>
): QuotaLimits => ({
  ...TIER_LIMITS[tier],
  ...override,
});
