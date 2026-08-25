export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPayload {
  name: string;
  description: string;
  slug?: string;
  displayOrder?: number;
}

export interface Author {
  id: string;
  name: string;
  institution: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleSource {
  id?: string;
  title: string;
  description?: string;
  url: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  categoryId: string;
  authorId: string;
  sources: ArticleSource[];
  author?: Pick<Author, "id" | "name" | "institution" | "bio">;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlePayload {
  title: string;
  summary: string;
  content: string;
  categoryId: string;
  authorId: string;
  sources: ArticleSource[];
}

export type UserRole = "admin" | "editor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserPayload {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorBody {
  error: true;
  message: string;
  code: string;
}
