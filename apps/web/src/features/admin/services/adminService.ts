// Capa de servei del panell d'administració.
// Va sobre l'apiClient compartit, que ja gestiona el Bearer token i la renovació en 401.
import apiClient from "@features/backend/api/apiClient";
import type {
  AdminStats,
  AdminUserList,
  AdminUserSummary,
  AdminSecurityEvent,
  AppConfig,
  UserStatus,
  QuotaLimits,
} from "@sequence-arasaac/shared-types";

// Filtres del llistat d'usuaris
export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  status?: UserStatus;
  search?: string;
}

export const getStats = async (): Promise<AdminStats> => {
  const { data } = await apiClient.get<AdminStats>("/admin/stats");
  return data;
};

export const listUsers = async (
  params: ListUsersParams,
): Promise<AdminUserList> => {
  const { data } = await apiClient.get<AdminUserList>("/admin/users", { params });
  return data;
};

export const updateUser = async (
  id: string,
  update: { status?: UserStatus; quotaOverride?: Partial<QuotaLimits> },
): Promise<AdminUserSummary> => {
  const { data } = await apiClient.patch<AdminUserSummary>(
    `/admin/users/${id}`,
    update,
  );
  return data;
};

export const listEvents = async (params: {
  emailCanonical?: string;
  ipHash?: string;
  limit?: number;
}): Promise<AdminSecurityEvent[]> => {
  const { data } = await apiClient.get<AdminSecurityEvent[]>("/admin/events", {
    params,
  });
  return data;
};

/** Error que ha arribat a un usuari, tal com el guarda el registre del servidor. */
export interface AdminClientError {
  id: string;
  code: string;
  context: string;
  detail?: string;
  userAgent?: string;
  emailCanonical?: string;
  createdAt: string;
}

export const listClientErrors = async (): Promise<AdminClientError[]> => {
  const { data } = await apiClient.get<{ errors: AdminClientError[] }>(
    "/admin/client-errors",
  );
  return data.errors;
};

export const getConfig = async (): Promise<AppConfig> => {
  const { data } = await apiClient.get<AppConfig>("/admin/config");
  return data;
};

export const updateConfig = async (update: {
  registrationOpen?: boolean;
  maxUsers?: number;
}): Promise<AppConfig> => {
  const { data } = await apiClient.put<AppConfig>("/admin/config", update);
  return data;
};
