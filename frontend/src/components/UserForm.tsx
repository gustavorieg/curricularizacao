import { useState } from "react";
import type { User, UserPayload, UserRole } from "../types";

interface UserFormProps {
  initial?: User;
  submitting: boolean;
  onSubmit: (payload: UserPayload) => void;
  onCancel: () => void;
}

export function UserForm({ initial, submitting, onSubmit, onCancel }: UserFormProps) {
  const isEditing = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<UserRole>(initial?.role ?? "editor");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Preencha nome e email.");
      return;
    }
    if (!isEditing && (!password || password.length < 6)) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (isEditing && password && password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }

    const payload: UserPayload = {
      name: name.trim(),
      email: email.trim(),
      role,
    };
    if (password) {
      payload.password = password;
    }

    onSubmit(payload);
  }

  return (
    <form className="article-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <label className="field">
        <span>Nome</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Papel</span>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="admin">Administrador</option>
            <option value="editor">Editor</option>
          </select>
        </label>

        <label className="field">
          <span>{isEditing ? "Nova senha (opcional)" : "Senha"}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEditing ? "Deixe em branco para manter" : "Minimo 6 caracteres"}
            autoComplete="new-password"
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Salvando..." : "Salvar usuario"}
        </button>
      </div>
    </form>
  );
}
