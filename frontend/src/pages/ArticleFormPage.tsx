import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArticleForm } from "../components/ArticleForm";
import { articleService } from "../services/article-service";
import { categoryService } from "../services/category-service";
import { authorService } from "../services/author-service";
import { extractErrorMessage } from "../services/api-client";
import type { Article, ArticlePayload, Author, Category } from "../types";
import { AlertIcon } from "../components/icons";

export function ArticleFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [categoriesRes, authorsRes, articleRes] = await Promise.all([
          categoryService.list(),
          authorService.list(),
          isEditing && id ? articleService.getById(id) : Promise.resolve(undefined),
        ]);
        if (cancelled) return;
        setCategories(categoriesRes);
        setAuthors(authorsRes);
        setArticle(articleRes);
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  async function handleSubmit(payload: ArticlePayload) {
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing && id) {
        await articleService.update(id, payload);
      } else {
        await articleService.create(payload);
      }
      navigate("/articles");
    } catch (err) {
      setError(extractErrorMessage(err));
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="state-panel">
          <span className="spinner" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{isEditing ? "Editar artigo" : "Novo artigo"}</h1>
          <p>{isEditing ? "Atualize o conteúdo publicado no app." : "Publique um novo conteúdo no app."}</p>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          {error}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="alert alert-error">
          <AlertIcon />É necessário ter ao menos uma categoria cadastrada na API antes de criar artigos.
        </div>
      ) : (
        <ArticleForm
          initial={article}
          categories={categories}
          authors={authors}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/articles")}
        />
      )}
    </div>
  );
}
