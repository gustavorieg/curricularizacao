import { apiClient } from "./api-client";
import type { Category, CategoryPayload } from "../types";

export const categoryService = {
  async list() {
    const { data } = await apiClient.get<{ data: Category[] }>("/categories");
    return data.data;
  },

  async create(payload: CategoryPayload) {
    const { data } = await apiClient.post<Category>("/categories", payload);
    return data;
  },

  async update(id: string, payload: Partial<CategoryPayload>) {
    const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload);
    return data;
  },

  async remove(id: string) {
    await apiClient.delete(`/categories/${id}`);
  },
};
