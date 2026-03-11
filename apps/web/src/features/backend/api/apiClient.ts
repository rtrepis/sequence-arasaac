// Client HTTP centralitzat per a totes les crides al backend propi.
// Gestiona automàticament els tokens JWT: injecció en headers i renovació en 401.
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Token en memòria (no accessible des de JS extern, protecció XSS)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;

const apiClient: AxiosInstance = axios.create({
  // En dev, Vite proxeja /api → http://localhost:3000. En prod, URL relativa al mateix origen.
  baseURL: "/api",
  withCredentials: true, // Necessari per enviar/rebre la cookie httpOnly del refresh token
});

// Interceptor de request: afegeix el Bearer token si existeix
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Evitar loop infinit: no reintentam la pròpia crida de refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
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
