// Capa de servei per a l'autenticació: encapsula les crides HTTP d'auth.
import apiClient from "../../api/apiClient";
import { UserUseCase } from "@sequence-arasaac/shared-types";

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

export interface SignupResponse {
  // Indica si el correu de benvinguda ha pogut sortir. Que sigui false no vol
  // dir que el signup hagi fallat — el compte ja existeix i es pot reenviar.
  emailSent: boolean;
}

// Crea el compte sense contrasenya: s'estableix després, a /set-password
export const signup = async (input: {
  name: string;
  useCase: UserUseCase;
  useCaseOther?: string;
  email: string;
}): Promise<SignupResponse> => {
  const { data } = await apiClient.post<SignupResponse>("/auth/signup", input);
  return data;
};

// Estableix la contrasenya a partir del token de l'enllaç del correu (verificació
// inicial o recuperació) i fa login automàtic — mateixa resposta que login().
export const setPassword = async (
  token: string,
  password: string,
  passwordConfirmation: string,
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/set-password", {
    token,
    password,
    passwordConfirmation,
  });
  return data;
};

// Demana el correu de recuperació de contrasenya. Sempre resol igual,
// existeixi o no el compte: el backend no ho distingeix de cara enfora.
export const forgotPassword = async (email: string): Promise<void> => {
  await apiClient.post("/auth/forgot-password", { email });
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

// Demana un correu de verificació nou. Ja no requereix sessió: un compte sense
// contrasenya encara no es pot autenticar per demanar-lo.
export const resendVerification = async (email: string): Promise<void> => {
  await apiClient.post("/auth/resend-verification", { email });
};
