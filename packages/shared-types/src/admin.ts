// Tipus del panell d'administració, compartits entre l'API i el frontend

import type {
  LangsApp,
  UserRole,
  UserStatus,
  UserTier,
  UserUsage,
  UserUseCase,
  QuotaLimits,
} from "./ui";

// Fila de la taula d'usuaris. No inclou mai el hash de la contrasenya
// ni les preferències: el panell serveix per moderar, no per espiar.
export interface AdminUserSummary {
  id: string;
  email: string;
  name?: string;
  // Idioma del compte. Al panell no es pinta enlloc —els seus textos són en
  // català— però hi ha d'arribar: l'enllaç d'accés es fa arribar amb un correu
  // escrit a mà, i qui el rep no té per què entendre el català.
  lang: LangsApp;
  useCase?: UserUseCase;
  status: UserStatus;
  role: UserRole;
  emailVerified: boolean;
  tier: UserTier;
  usage: UserUsage;
  quotaOverride?: Partial<QuotaLimits>;
  createdAt: string;
  lastLoginAt?: string;
}

// Enllaç d'establiment de contrasenya generat des del panell, per fer-lo
// arribar a mà quan el correu no és una via disponible.
// "verify" és la primera contrasenya d'un compte; "reset" en substitueix una
// que ja existeix. Caduquen diferent, i per això `expiresAt` viatja amb l'URL:
// qui el passa ha de poder dir fins quan serveix.
export interface AdminPasswordLink {
  url: string;
  type: "verify" | "reset";
  expiresAt: string;
}

// Resposta paginada del llistat d'usuaris
export interface AdminUserList {
  users: AdminUserSummary[];
  total: number;
  page: number;
  pageSize: number;
}

// Xifres de capçalera del panell
export interface AdminStats {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  pendingVerification: number;
  suspendedUsers: number;
  totalDocuments: number;
  totalStorageBytes: number;
}

// Esdeveniment de seguretat tal com el veu el panell.
// ipHash no és una IP: és l'HMAC que permet correlacionar orígens sense conèixer-los.
export interface AdminSecurityEvent {
  id: string;
  type: string;
  emailCanonical?: string;
  ipHash: string;
  detail?: string;
  createdAt: string;
}
