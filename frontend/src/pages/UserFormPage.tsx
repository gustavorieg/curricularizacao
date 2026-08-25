import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserForm } from "../components/UserForm";
import { userService } from "../services/user-service";
import { extractErrorMessage } from "../services/api-client";
import type { User, UserPayload } from "../types";
import { AlertIcon } from "../components/icons";
import { useToast } from "../context/ToastContext";

export function UserFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [user, setUser] = useState<User | undefined>(undefined);
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
        const users = await userService.list();
        const found = users.find((u) => u.id === id);
        if (!cancelled) setUser(found);
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

  async function handleSubmit(payload: UserPayload) {
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing && id) {
        await userService.update(id, payload);
        showToast("Usuário atualizado com sucesso.");
      } else {
        await userService.create(payload);
        showToast("Usuário criado com sucesso.");
      }
      navigate("/users");
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
          <h1>{isEditing ? "Editar usuário" : "Novo usuário"}</h1>
          <p>{isEditing ? "Atualize os dados de acesso ao painel." : "Conceda acesso ao painel administrativo."}</p>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          {error}
        </div>
      )}

      <UserForm
        initial={user}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/users")}
      />
    </div>
  );
}
