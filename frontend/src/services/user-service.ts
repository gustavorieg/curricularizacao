import { apiClient } from "./api-client";
import type { User, UserPayload } from "../types";

export const userService = {
  async list() {
    const { data } = await apiClient.get<{ data: User[] }>("/users");
    return data.data;
  },

  async create(payload: UserPayload) {
    const { data } = await apiClient.post<User>("/users", payload);
    return data;
  },

  async update(id: string, payload: Partial<UserPayload>) {
    const { data } = await apiClient.patch<User>(`/users/${id}`, payload);
    return data;
  },

  async remove(id: string) {
    await apiClient.delete(`/users/${id}`);
  },
};
