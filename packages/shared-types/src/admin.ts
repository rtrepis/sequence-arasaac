// Tipus del panell d'administració, compartits entre l'API i el frontend

import type { UserRole, UserStatus, UserTier, UserUsage, QuotaLimits } from "./ui";

// Fila de la taula d'usuaris. No inclou mai el hash de la contrasenya
// ni les preferències: el panell serveix per moderar, no per espiar.
export interface AdminUserSummary {
  id: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  emailVerified: boolean;
  tier: UserTier;
  usage: UserUsage;
  quotaOverride?: Partial<QuotaLimits>;
  createdAt: string;
  lastLoginAt?: string;
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
