// Capa de servei per a l'autenticació: encapsula les crides HTTP d'auth.
import apiClient from "../../api/apiClient";

export interface AuthResponse {
  accessToken: string;
  // Només arriba al registre: indica si el correu de verificació ha pogut sortir.
  // Que sigui false no vol dir que el registre hagi fallat — el compte ja existeix.
  verificationEmailSent?: boolean;
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

// isBackgroundRequest: cert quan el refresc és la restauració silenciosa d'arrencada,
// que ningú ha demanat i, per tant, no ha d'encendre l'avís de servidor despertant-se.
export const refreshToken = async (
  isBackgroundRequest = false,
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/refresh", null, {
    isBackgroundRequest,
  });
  return data;
};

// Confirma l'adreça a partir del token de l'enllaç rebut per correu
export const verifyEmail = async (token: string): Promise<void> => {
  await apiClient.get("/auth/verify", { params: { token } });
};

// Demana un correu de verificació nou. Requereix sessió iniciada.
export const resendVerification = async (): Promise<void> => {
  await apiClient.post("/auth/resend-verification");
};
