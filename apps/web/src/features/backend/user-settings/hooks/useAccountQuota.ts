// Consum del compte, ja traduït a les xifres que es poden ensenyar i decidir.
//
// El càlcul viu aquí i no a cada component perquè n'hi ha tres que el fan servir
// —el resum d'espai, el botó de pujar una imatge i el llistat d'imatges— i tots
// tres han de dir el mateix número. La regla que no es pot trencar: mentre no se
// sap res del compte (`usage` a null), `hasQuota` és fals i ningú ha d'inventar
// un límit; qui treballa sense compte no en té cap.
import { useAppSelector } from "@/app/hooks";
import type { ImageQuality } from "@/types/ui";
import { IMAGE_QUALITY_PRESETS } from "@/utils/imageToBase64";

export interface AccountQuota {
  /** Cert només quan el servidor ha dit com està el compte. */
  hasQuota: boolean;
  documentsUsed: number;
  documentsLimit: number;
  wordProfilesUsed: number;
  wordProfilesLimit: number;
  storageUsedBytes: number;
  storageLimitBytes: number;
  /** Mai negatiu: un compte per damunt del límit té zero, no un dèficit. */
  remainingBytes: number;
  /** Part de l'espai gastada, de 0 a 1, per a la barra de progrés. */
  storageRatio: number;
  /** Imatges que hi caben amb la qualitat triada, si se sap del cert. */
  remainingImages: number | null;
}

/** Imatges que caben en un espai, al pes objectiu d'un nivell de qualitat. */
export const imagesThatFit = (
  availableBytes: number,
  quality: ImageQuality,
): number =>
  Math.floor(availableBytes / IMAGE_QUALITY_PRESETS[quality].targetBytes);

export const useAccountQuota = (): AccountQuota => {
  const usage = useAppSelector((state) => state.quota.usage);
  const limits = useAppSelector((state) => state.quota.limits);
  const imageQuality = useAppSelector((state) => state.ui.imageQuality);

  if (!usage || !limits) {
    return {
      hasQuota: false,
      documentsUsed: 0,
      documentsLimit: 0,
      wordProfilesUsed: 0,
      wordProfilesLimit: 0,
      storageUsedBytes: 0,
      storageLimitBytes: 0,
      remainingBytes: 0,
      storageRatio: 0,
      remainingImages: null,
    };
  }

  const remainingBytes = Math.max(0, limits.storageBytes - usage.storageBytes);

  return {
    hasQuota: true,
    documentsUsed: usage.documentsCount,
    documentsLimit: limits.documents,
    wordProfilesUsed: usage.wordProfilesCount,
    wordProfilesLimit: limits.wordProfiles,
    storageUsedBytes: usage.storageBytes,
    storageLimitBytes: limits.storageBytes,
    remainingBytes,
    storageRatio:
      limits.storageBytes > 0
        ? Math.min(1, usage.storageBytes / limits.storageBytes)
        : 0,
    remainingImages: imagesThatFit(remainingBytes, imageQuality),
  };
};
