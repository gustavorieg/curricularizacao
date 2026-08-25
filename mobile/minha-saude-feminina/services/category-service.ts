import { apiRequest } from '@/lib/http/api-client';
import type { ApiListResponse } from '@/types/api';
import type { Category } from '@/types/category';

export const categoryService = {
  list(): Promise<ApiListResponse<Category>> {
    return apiRequest<ApiListResponse<Category>>('/categories');
  },

  getByIdOrSlug(idOrSlug: string): Promise<Category> {
    return apiRequest<Category>(`/categories/${encodeURIComponent(idOrSlug)}`);
  },
};
