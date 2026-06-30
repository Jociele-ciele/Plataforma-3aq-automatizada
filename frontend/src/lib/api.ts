import axios from "axios";
import { useAuthStore } from "@/store/auth";

function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) return "/api";
  if (raw.endsWith("/api")) return raw;
  if (raw.startsWith("http")) return `${raw.replace(/\/$/, "")}/api`;
  return raw;
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let estaAtualizando = false;
let fila: Array<(t: string) => void> = [];

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      const { refreshToken, setTokens, logout } = useAuthStore.getState();
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      if (estaAtualizando) {
        return new Promise((resolve) => {
          fila.push((novoToken) => {
            originalRequest.headers.Authorization = `Bearer ${novoToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      estaAtualizando = true;
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );
        setTokens(data.accessToken, data.refreshToken);
        fila.forEach((cb) => cb(data.accessToken));
        fila = [];
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (e) {
        logout();
        return Promise.reject(e);
      } finally {
        estaAtualizando = false;
      }
    }
    return Promise.reject(error);
  }
);
