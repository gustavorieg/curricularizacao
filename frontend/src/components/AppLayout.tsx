import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth-service";
import { ArticleIcon, CategoryIcon, HeartMark, LogoutIcon, UsersIcon } from "./icons";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  editor: "Editor",
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await authService.logout();
    logout();
    navigate("/login");
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">
          <div className="app-sidebar-brand-mark">
            <HeartMark />
          </div>
          <div className="app-sidebar-brand-text">
            <strong>Minha Saúde Feminina</strong>
            <span>Painel administrativo</span>
          </div>
        </div>

        <nav className="app-nav-links">
          <NavLink to="/articles" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <ArticleIcon />
            Artigos
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <CategoryIcon />
            Categorias
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <UsersIcon />
            Usuários
          </NavLink>
        </nav>

        <div className="app-sidebar-footer">
          {user ? (
            <div className="app-nav-user">
              <div className="app-nav-avatar">{initials}</div>
              <div className="app-nav-user-info">
                <span className="app-nav-name">{user.name}</span>
                <span className="app-nav-role">{ROLE_LABELS[user.role] ?? user.role}</span>
              </div>
            </div>
          ) : null}
          <button className="btn-logout" onClick={() => void handleLogout()}>
            <LogoutIcon />
            Sair
          </button>
        </div>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}
