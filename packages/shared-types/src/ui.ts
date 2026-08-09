import { Border, Font, Hair, Skin, TextPosition } from "./sequence";

// Idiomes suportats per la interfície de l'aplicació (subconjunt de Languages)
export type LangsApp = "ca" | "en" | "es" | "fr" | "it";

export type ThemeMode = "light" | "dark" | "system";

export type PageSize = "A4" | "A3" | "FULLSCREEN";

export interface ViewSettings {
  sizePict: number;
  pictSpaceBetween: number;
  sequenceSpaceBetween: number;
  alignmentH: "left" | "center" | "right";
  alignmentV: "top" | "center" | "bottom";
  direction: "row" | "column";
  pageSize: PageSize;
  orientation: "landscape" | "portrait";
  author: string;
}

export type UserTier = "free";

// Estat del cicle de vida del compte:
// "pending" = registrat però sense verificar el correu (pot entrar, no pot desar al núvol)
// "active" = verificat i operatiu
// "suspended" = bloquejat des del panell d'administració
export type UserStatus = "pending" | "active" | "suspended";

// Permís, no pla comercial: "role" i "tier" són conceptes independents
export type UserRole = "user" | "admin";

// Comptadors desnormalitzats al document d'usuari.
// Es mantenen amb $inc a la mateixa operació que crea o esborra el recurs,
// perquè comprovar una quota no hagi de fer un countDocuments a cada petició.
export interface UserUsage {
  documentsCount: number;
  wordProfilesCount: number;
  storageBytes: number;
  assetsCount: number;
}

// Límits efectius d'un usuari. Els valors per defecte viuen al codi (TIER_LIMITS);
// això només serveix per a excepcions puntuals sense inventar un tier nou.
export interface QuotaLimits {
  documents: number;
  wordProfiles: number;
  storageBytes: number;
}

// Configuració global de l'aplicació, editable des del panell d'administració.
// Viu a la base de dades i no a les variables d'entorn perquè tancar el registre
// hagi de ser un clic i no un desplegament.
export interface AppConfig {
  registrationOpen: boolean;
  maxUsers: number;
  updatedAt: string;
}

export interface WordProfile {
  word: string;
  overrides: Partial<Pick<import("./sequence").PictApiAraSettings, "skin" | "hair" | "color" | "fitzgerald">>;
  selectedId?: number;
  customImageUrl?: string;
}

export interface UserUiSettings {
  lang: { app: LangsApp; search: string };
  theme: ThemeMode;
  viewSettings?: ViewSettings;
  defaultSettings: DefaultSettings;
  wordProfiles?: WordProfile[];
  tier?: UserTier;
  // Estat del compte. Viatja amb les preferències perquè el frontend el sàpiga
  // en restaurar la sessió, sense una crida addicional: decideix si cal
  // mostrar l'avís de verificació i si s'ensenya l'accés al panell d'admin.
  emailVerified?: boolean;
  role?: UserRole;
}

export interface DefaultSettings {
  pictSequence: DefaultSettingsPictSequence;
  pictApiAra: DefaultSettingsPictAra;
}

export interface DefaultSettingsPictAra {
  hair: Hair;
  skin: Skin;
  fitzgerald: string;
  color: boolean;
}

export interface DefaultSettingsPictSequence {
  numbered: boolean;
  textPosition: TextPosition;
  font: Font;
  numberFont: Font;
  borderOut: Border;
  borderIn: Border;
}
