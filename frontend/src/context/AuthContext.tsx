import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { User } from "../types";

const TOKEN_KEY = "msf_admin_token";
const USER_KEY = "msf_admin_user";
const API_KEY_KEY = "msf_admin_api_key";

interface AuthContextValue {
  token: string | null;
  apiKey: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  loginWithApiKey: (apiKey: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

const API_KEY_USER: User = {
  id: "api-key",
  name: "Acesso via chave de API",
  email: "",
  role: "admin",
  createdAt: "",
  updatedAt: "",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem(API_KEY_KEY));
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      apiKey,
      user,
      isAuthenticated: Boolean(token || apiKey),
      login: (nextToken: string, nextUser: User) => {
        localStorage.removeItem(API_KEY_KEY);
        localStorage.setItem(TOKEN_KEY, nextToken);
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setApiKey(null);
        setToken(nextToken);
        setUser(nextUser);
      },
      loginWithApiKey: (nextApiKey: string) => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.setItem(API_KEY_KEY, nextApiKey);
        setToken(null);
        setUser(API_KEY_USER);
        setApiKey(nextApiKey);
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(API_KEY_KEY);
        setToken(null);
        setApiKey(null);
        setUser(null);
      },
    }),
    [token, apiKey, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
