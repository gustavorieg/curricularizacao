import axios from "axios";

const TOKEN_KEY = "msf_admin_token";
const USER_KEY = "msf_admin_user";
const API_KEY_KEY = "msf_admin_api_key";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3333/api/v1",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const apiKey = localStorage.getItem(API_KEY_KEY);
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (apiKey && !config.headers["x-api-key"]) {
    config.headers["x-api-key"] = apiKey;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(API_KEY_KEY);
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.response?.status === 401) return "Sessao invalida ou expirada. Faca login novamente.";
    if (error.message) return error.message;
  }
  return "Ocorreu um erro inesperado.";
}
