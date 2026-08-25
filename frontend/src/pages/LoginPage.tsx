import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth-service";
import { extractErrorMessage } from "../services/api-client";
import { AlertIcon, HeartMark } from "../components/icons";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@minhasaudefeminina.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Informe email e senha.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { token, user } = await authService.login(email.trim(), password);
      login(token, user);
      navigate("/articles");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-hero-brand">
          <div className="login-hero-brand-mark">
            <HeartMark />
          </div>
          <span>Minha Saúde Feminina</span>
        </div>
        <div className="login-hero-copy">
          <h2>Cuidar de quem informa é o primeiro passo para cuidar de quem lê.</h2>
          <p>
            Gerencie artigos, categorias e usuários do conteúdo que chega até milhares de
            mulheres em busca de informação de saúde clara e confiável.
          </p>
        </div>
        <div className="login-hero-footer">© {new Date().getFullYear()} Minha Saúde Feminina · Painel interno</div>
      </div>

      <div className="login-panel">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <h1>Bem-vinda de volta</h1>
          <p className="subtitle">Entre com suas credenciais para acessar o painel.</p>

          {error && (
            <div className="alert alert-error" role="alert">
              <AlertIcon />
              {error}
            </div>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@minhasaudefeminina.com"
              autoFocus
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn-primary" disabled={submitting} style={{ width: "100%", padding: "12px 16px" }}>
            {submitting ? (
              <>
                <span className="spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.4)" }} />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
