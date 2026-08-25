import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { categoryService } from "../services/category-service";
import { extractErrorMessage } from "../services/api-client";
import type { Category } from "../types";
import { AlertIcon, CategoryIcon, EditIcon, PlusIcon, TrashIcon } from "../components/icons";

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(category: Category) {
    if (!window.confirm(`Deletar a categoria "${category.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setDeletingId(category.id);
    try {
      await categoryService.remove(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    } catch (err) {
      window.alert(extractErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Categorias</h1>
          <p>Temas usados para organizar os artigos do app.</p>
        </div>
        <div className="header-actions">
          <Link to="/categories/new" className="btn-primary">
            <PlusIcon />
            Nova categoria
          </Link>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          {error}
        </div>
      )}

      {loading ? (
        <div className="state-panel">
          <span className="spinner" />
          <p>Carregando categorias...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="state-panel">
          <CategoryIcon width={30} height={30} />
          <strong>Nenhuma categoria encontrada</strong>
          <p>Crie a primeira categoria para organizar os artigos.</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ordem</th>
                <th>Atualizado em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="cell-title">{category.name}</td>
                  <td className="muted">{category.description}</td>
                  <td>{category.displayOrder}</td>
                  <td className="muted">{new Date(category.updatedAt).toLocaleString("pt-BR")}</td>
                  <td className="actions-cell">
                    <Link to={`/categories/${category.id}/edit`} className="btn-link">
                      <EditIcon />
                      Editar
                    </Link>
                    <button
                      className="btn-link danger"
                      onClick={() => handleDelete(category)}
                      disabled={deletingId === category.id}
                    >
                      <TrashIcon />
                      {deletingId === category.id ? "Deletando..." : "Deletar"}
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
