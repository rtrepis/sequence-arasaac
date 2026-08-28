// Client HTTP centralitzat per a totes les crides al backend propi.
// Gestiona automàticament els tokens JWT: injecció en headers i renovació en 401.
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { notifyRequestEnd, notifyRequestStart } from "./backendStatus";
import { notifySessionExpired } from "./sessionExpiry";

declare module "axios" {
  export interface AxiosRequestConfig {
    /**
     * Petició que no neix d'una acció explícita de l'usuari (ping de desvetllament,
     * restauració silenciosa de sessió en arrencar). No compta per a l'avís de
     * "servidor despertant-se": ningú està esperant-la i anunciar-la seria soroll.
     */
    isBackgroundRequest?: boolean;
  }
}

// Token en memòria (no accessible des de JS extern, protecció XSS)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;

// Marge ampli a propòsit: un desvetllament de Render pot vorejar el minut i tallar-lo
// convertiria una espera llarga en un error, just quan el servidor ja anava a respondre.
const REQUEST_TIMEOUT_MS = 90_000;

const apiClient: AxiosInstance = axios.create({
  // En dev, Vite proxeja /api → http://localhost:3000. En prod, usa VITE_API_URL si està definida.
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true, // Necessari per enviar/rebre la cookie httpOnly del refresh token
  timeout: REQUEST_TIMEOUT_MS,
});

// Interceptor de request: afegeix el Bearer token si existeix i obre el comptatge
// de peticions en vol que alimenta l'avís de desvetllament
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (!config.isBackgroundRequest) notifyRequestStart();
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Codi semàntic de la fallada del refresc. El servidor en pot respondre cinc
 * (`REFRESH_TOKEN_MISSING`, `REFRESH_TOKEN_EXPIRED`, `INVALID_REFRESH_TOKEN`,
 * `USER_NOT_FOUND` i `ACCOUNT_SUSPENDED`) i no volen dir el mateix: als dos
 * últims no se'ls pot convidar a tornar a entrar.
 */
const getRefreshFailureCode = (error: unknown): string =>
  (error as { response?: { data?: { errorCode?: string } } })?.response?.data
    ?.errorCode ?? "REFRESH_TOKEN_EXPIRED";

// Variable per evitar bucles infinits de refresh
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null): void => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  refreshQueue = [];
};

// Interceptor de response: si 401, intenta renovar el token i reintenta la petició original
apiClient.interceptors.response.use(
  (response) => {
    if (!response.config.isBackgroundRequest) notifyRequestEnd();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Es tanca aquí, abans de qualsevol reintent: el reintent torna a passar pel
    // interceptor de request i obre el seu propi comptatge.
    if (originalRequest && !originalRequest.isBackgroundRequest) {
      notifyRequestEnd();
    }

    // Evitar loop infinit i no interceptar errors d'autenticació intencionats
    // Les rutes /auth/* gestionen els seus propis errors — mai cal renovar el token aquí
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      if (isRefreshing) {
        // Si ja s'està renovant, encua la petició
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post<{ accessToken: string }>(
          "/auth/refresh",
        );
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Només si hi havia sessió: sense token a la memòria, un 401 no és una
        // sessió que cau sinó una petició que no n'ha tingut mai, i dir-li a qui
        // no ha entrat mai que se li ha acabat la sessió seria mentir-li
        if (accessToken !== null) {
          notifySessionExpired(getRefreshFailureCode(refreshError));
        }
        setAccessToken(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
