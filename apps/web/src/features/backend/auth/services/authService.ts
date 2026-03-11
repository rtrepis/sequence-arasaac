// Capa de servei per a l'autenticació: encapsula les crides HTTP d'auth.
import apiClient from "../../api/apiClient";

export interface AuthResponse {
  accessToken: string;
}

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return data;
};

export const register = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", {
    email,
    password,
  });
  return data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

export const refreshToken = async (): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/refresh");
  return data;
};
