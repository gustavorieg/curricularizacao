import { apiClient } from "./api-client";
import type { User } from "../types";

export const authService = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post<{ token: string; user: User }>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  async logout() {
    await apiClient.post("/auth/logout").catch(() => {});
  },
};
