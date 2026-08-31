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

// Els números del pla gratuït surten del pressupost de Cloudinary i d'Atlas, no
// d'una intuïció (vegeu docs/ESTUDI-limits-serveis-gratuits.md):
//
// - storageBytes de 5 MB amb el sostre de MAX_IMAGE_BYTES vol dir **10 imatges
//   pròpies garantides** per compte, entre documents i vocabulari. És el número
//   que es pot comunicar a l'usuari, perquè és el que ningú pot superar.
// - Amb 10 documents compactats (~15,6 KB cadascun) i 5 MB d'imatges, els dos
//   sostres coincideixen a uns 3.000 comptes plens del tot: ni Atlas ni
//   Cloudinary és el baula feble, que és com han de quedar.
// - wordProfiles a 3 no és cap retallada: el front ja ho aplicava des de sempre
//   amb FREE_TIER_MAX_WORDS (VocabularySettingsPanel bloqueja el desat en
//   arribar-hi i el missatge diu la xifra). El 200 d'aquí era lletra morta, i un
//   límit que el servidor declara però que ningú fa complir no protegeix res:
//   és el mateix error que tenia el vocabulari amb les imatges.
export const TIER_LIMITS: Record<UserTier, QuotaLimits> = {
  free: {
    documents: 10,
    wordProfiles: 3,
    storageBytes: 5 * MEGABYTE,
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
