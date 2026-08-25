import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { articleService } from "../services/article-service";
import { categoryService } from "../services/category-service";
import { extractErrorMessage } from "../services/api-client";
import type { Article, Category } from "../types";
import { AlertIcon, ArticleIcon, EditIcon, PlusIcon, SearchIcon, TrashIcon } from "../components/icons";
import { useToast } from "../context/ToastContext";

export function ArticlesPage() {
  const { showToast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        articleService.list({ q, pageSize: 100 }),
        categoryService.list(),
      ]);
      setArticles(articlesRes.data);
      setCategories(categoriesRes);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? "-";
  }

  async function handleDelete(article: Article) {
    if (!window.confirm(`Deletar o artigo "${article.title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setDeletingId(article.id);
    try {
      await articleService.remove(article.id);
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      showToast("Artigo removido com sucesso.");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setDeletingId(null);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(search);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Artigos</h1>
          <p>Conteúdos de saúde publicados no app.</p>
        </div>
        <div className="header-actions">
          <Link to="/articles/new" className="btn-primary">
            <PlusIcon />
            Novo artigo
          </Link>
        </div>
      </header>

      <form className="search-bar" onSubmit={handleSearch}>
        <div className="search-bar-input">
          <SearchIcon />
          <input
            type="search"
            placeholder="Buscar por título, resumo ou conteúdo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-secondary">
          Buscar
        </button>
      </form>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          {error}
        </div>
      )}

      {loading ? (
        <div className="state-panel">
          <span className="spinner" />
          <p>Carregando artigos...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="state-panel">
          <ArticleIcon width={30} height={30} />
          <strong>Nenhum artigo encontrado</strong>
          <p>Ajuste a busca ou crie o primeiro artigo do painel.</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Autor</th>
                <th>Atualizado em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="cell-title">{article.title}</td>
                  <td>
                    <span className="badge badge-category">{categoryName(article.categoryId)}</span>
                  </td>
                  <td>{article.author?.name ?? "-"}</td>
                  <td className="muted">{new Date(article.updatedAt).toLocaleString("pt-BR")}</td>
                  <td className="actions-cell">
                    <Link to={`/articles/${article.id}/edit`} className="btn-link">
                      <EditIcon />
                      Editar
                    </Link>
                    <button
                      className="btn-link danger"
                      onClick={() => handleDelete(article)}
                      disabled={deletingId === article.id}
                    >
                      <TrashIcon />
                      {deletingId === article.id ? "Deletando..." : "Deletar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
