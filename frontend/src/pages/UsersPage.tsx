import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userService } from "../services/user-service";
import { extractErrorMessage } from "../services/api-client";
import type { User } from "../types";
import { useAuth } from "../context/AuthContext";
import { AlertIcon, EditIcon, PlusIcon, TrashIcon, UsersIcon } from "../components/icons";

const ROLE_LABELS: Record<User["role"], string> = {
  admin: "Administrador",
  editor: "Editor",
};

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.list();
      setUsers(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(user: User) {
    if (!window.confirm(`Deletar o usuário "${user.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setDeletingId(user.id);
    try {
      await userService.remove(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
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
          <h1>Usuários</h1>
          <p>Quem tem acesso ao painel administrativo.</p>
        </div>
        <div className="header-actions">
          <Link to="/users/new" className="btn-primary">
            <PlusIcon />
            Novo usuário
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
          <p>Carregando usuários...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="state-panel">
          <UsersIcon width={30} height={30} />
          <strong>Nenhum usuário encontrado</strong>
          <p>Crie o primeiro usuário para acessar o painel.</p>
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Papel</th>
                <th>Atualizado em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="cell-title">
                    {user.name}
                    {currentUser?.id === user.id ? <span className="muted"> (você)</span> : null}
                  </td>
                  <td className="muted">{user.email}</td>
                  <td>
                    <span className={user.role === "admin" ? "badge badge-role-admin" : "badge badge-role-editor"}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="muted">{new Date(user.updatedAt).toLocaleString("pt-BR")}</td>
                  <td className="actions-cell">
                    <Link to={`/users/${user.id}/edit`} className="btn-link">
                      <EditIcon />
                      Editar
                    </Link>
                    <button
                      className="btn-link danger"
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user.id || users.length === 1}
                      title={users.length === 1 ? "Não é possível remover o único usuário" : undefined}
                    >
                      <TrashIcon />
                      {deletingId === user.id ? "Deletando..." : "Deletar"}
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
