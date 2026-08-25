import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CategoryForm } from "../components/CategoryForm";
import { categoryService } from "../services/category-service";
import { extractErrorMessage } from "../services/api-client";
import type { Category, CategoryPayload } from "../types";
import { AlertIcon } from "../components/icons";

export function CategoryFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing || !id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const categories = await categoryService.list();
        const found = categories.find((c) => c.id === id);
        if (!cancelled) setCategory(found);
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

  async function handleSubmit(payload: CategoryPayload) {
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing && id) {
        await categoryService.update(id, payload);
      } else {
        await categoryService.create(payload);
      }
      navigate("/categories");
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
          <h1>{isEditing ? "Editar categoria" : "Nova categoria"}</h1>
          <p>{isEditing ? "Atualize o tema usado para organizar artigos." : "Crie um novo tema para organizar artigos."}</p>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          {error}
        </div>
      )}

      <CategoryForm
        initial={category}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/categories")}
      />
    </div>
  );
}
