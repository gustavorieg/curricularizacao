import { apiClient } from "./api-client";
import type { Author } from "../types";

export const authorService = {
  async list() {
    const { data } = await apiClient.get<{ data: Author[] }>("/authors");
    return data.data;
  },

  async create(name: string) {
    const { data } = await apiClient.post<Author>("/authors", { name });
    return data;
  },
};
