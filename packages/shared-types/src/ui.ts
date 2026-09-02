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

// Motiu d'ús declarat al signup — serveix per conèixer el perfil de l'usuari,
// no per restringir res: "other" porta un text lliure opcional (useCaseOther).
export type UserUseCase = "family" | "teacher" | "professional" | "other";

// Comptadors desnormalitzats al document d'usuari.
// Es mantenen amb $inc a la mateixa operació que crea o esborra el recurs,
// perquè comprovar una quota no hagi de fer un countDocuments a cada petició.
export interface UserUsage {
  documentsCount: number;
  wordProfilesCount: number;
  storageBytes: number;
  assetsCount: number;
}

// Qualitat amb què es codifiquen les imatges que puja l'usuari.
//
// És una preferència, no un automatisme: la mida a què s'imprimirà un pictograma
// es tria després de pujar-lo, de manera que el client no la pot endevinar, i
// reduir una imatge és irreversible. Qui imprimeix a mida gran es queda amb
// "print"; qui té l'espai just pot triar de gastar-ne menys per imatge.
export type ImageQuality = "print" | "standard" | "compact";

// Consum i límits d'un compte tal com els veu el seu propietari.
// maxImageBytes hi va perquè és el que fa que "imatges que et caben" sigui una
// xifra i no una estimació: cap imatge no pot passar d'aquest pes.
export interface UserQuotaStatus {
  usage: UserUsage;
  limits: QuotaLimits;
  maxImageBytes: number;
}

// Una imatge pròpia del compte, amb el lloc d'on penja.
// L'origen decideix què passa en esborrar-la: la paraula del vocabulari es queda
// amb el seu pictograma d'ARASAAC, i el pictograma del document, sense imatge.
export interface UserAsset {
  publicId: string;
  url: string;
  bytes: number;
  // Píxels de la imatge desada. Serveixen per dir a quina mida s'imprimeix bé,
  // que és l'única manera que en té l'usuari de saber si li sobra qualitat o li
  // falta. Poden faltar: no es desen enlloc, es demanen a Cloudinary en llistar,
  // i si aquella petició falla val més una llista sense mides que cap llista.
  width?: number;
  height?: number;
  source: "document" | "vocabulary";
  documentId?: string;
  documentTitle?: string;
  word?: string;
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
  // Sostre d'altes per dia. És un fre diferent del maxUsers: aquell diu quanta
  // gent hi cap en total, aquest a quina velocitat pot entrar-hi.
  maxDailySignups: number;
  updatedAt: string;
}

// El que se sap del registre sense tenir compte: qui encara no n'ha creat cap
// ha de poder veure si hi queda lloc abans d'omplir el formulari, i quanta gent
// hi ha ja. No hi surt res que identifiqui ningú — només recomptes.
export interface RegistrationStatus {
  registrationOpen: boolean;
  // Quanta gent hi ha registrada i quantes places queden en total
  totalUsers: number;
  maxUsers: number;
  remainingUsers: number;
  // Altes del dia: quantes se n'han fet, quantes en queden i quan es reinicia
  // el comptador (mitjanit UTC, en ISO perquè el front el pinti en hora local)
  maxDailySignups: number;
  signupsToday: number;
  remainingToday: number;
  resetsAt: string;
  // Es pot crear un compte ara mateix? Les tres condicions resoltes en una,
  // perquè el front no les hagi de recompondre.
  canSignup: boolean;
}

// El que la pàgina d'establiment de contrasenya sap del compte abans que
// l'usuari hi escrigui res. Ho retorna el backend a canvi del token de l'enllaç
// del correu, i serveix per confirmar-li **a quin compte** entrarà: qui obre un
// enllaç d'un correu no ha de poder confondre'l amb el d'una altra persona que
// comparteixi el dispositiu, que en AAC és el cas normal.
//
// No obre cap via d'enumeració: qui té el token ja pot establir la contrasenya
// d'aquell compte, de manera que el nom i el correu no li diuen res que el
// mateix enllaç no li doni.
export interface PasswordLinkInfo {
  // Opcional perquè el model no exigeix nom (els comptes creats per
  // l'administrador poden no tenir-ne)
  name?: string;
  email: string;
  // "verify" = enllaç del correu de benvinguda; "reset" = de la recuperació
  type: "verify" | "reset";
  // Si el compte ja té contrasenya, la que s'estableixi ara en substitueix una
  // d'existent; si no, és la primera. És la diferència que la pàgina explica.
  hasPassword: boolean;
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
  imageQuality?: ImageQuality;
  tier?: UserTier;
  // Estat del compte. Viatja amb les preferències perquè el frontend el sàpiga
  // en restaurar la sessió, sense una crida addicional: decideix si cal
  // mostrar l'avís de verificació i si s'ensenya l'accés al panell d'admin.
  emailVerified?: boolean;
  role?: UserRole;
  // Consum i límits del compte. Viatgen amb les preferències perquè arribin sols
  // a cada restauració de sessió: la petició ja es fa, i el document d'usuari on
  // viuen els comptadors és el mateix que ja s'hi llegeix.
  usage?: UserUsage;
  limits?: QuotaLimits;
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
