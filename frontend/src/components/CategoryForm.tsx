import { useState } from "react";
import type { Category, CategoryPayload } from "../types";
import { AlertIcon } from "./icons";

interface CategoryFormProps {
  initial?: Category;
  submitting: boolean;
  onSubmit: (payload: CategoryPayload) => void;
  onCancel: () => void;
}

export function CategoryForm({ initial, submitting, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [displayOrder, setDisplayOrder] = useState(initial?.displayOrder?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !description.trim()) {
      setError("Preencha nome e descrição.");
      return;
    }

    const payload: CategoryPayload = {
      name: name.trim(),
      description: description.trim(),
    };
    if (slug.trim()) payload.slug = slug.trim();
    if (displayOrder.trim()) {
      const parsed = Number(displayOrder);
      if (Number.isNaN(parsed)) {
        setError("A ordem de exibição deve ser um número.");
        return;
      }
      payload.displayOrder = parsed;
    }

    onSubmit(payload);
  }

  return (
    <form className="article-form" onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          {error}
        </div>
      )}

      <label className="field">
        <span>Nome</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ciclo menstrual" />
      </label>

      <label className="field">
        <span>Descrição</span>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Uma breve descrição do que esta categoria reúne"
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Slug (opcional)</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="gerado automaticamente a partir do nome"
          />
        </label>

        <label className="field">
          <span>Ordem de exibição (opcional)</span>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            placeholder="Ex: 1"
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Salvando..." : "Salvar categoria"}
        </button>
      </div>
    </form>
  );
}
