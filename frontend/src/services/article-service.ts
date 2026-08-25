import { apiClient } from "./api-client";
import type { Article, ArticlePayload, Paginated } from "../types";

export const articleService = {
  async list(params?: { page?: number; pageSize?: number; q?: string; categoryId?: string }) {
    const { data } = await apiClient.get<Paginated<Article>>("/articles", { params });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get<Article>(`/articles/${id}`);
    return data;
  },

  async create(payload: ArticlePayload) {
    const { data } = await apiClient.post<Article>("/articles", payload);
    return data;
  },

  async update(id: string, payload: Partial<ArticlePayload>) {
    const { data } = await apiClient.patch<Article>(`/articles/${id}`, payload);
    return data;
  },

  async remove(id: string) {
    await apiClient.delete(`/articles/${id}`);
  },
};
