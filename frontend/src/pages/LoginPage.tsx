import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth-service";
import { extractErrorMessage } from "../services/api-client";
import { AlertIcon, HeartMark } from "../components/icons";

type LoginMode = "credentials" | "apiKey";

export function LoginPage() {
  const { login, loginWithApiKey } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>("credentials");

  const [email, setEmail] = useState("admin@minhasaudefeminina.com");
  const [password, setPassword] = useState("admin123");
  const [apiKey, setApiKey] = useState("admin-secret-key");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCredentialsSubmit(e: React.FormEvent) {
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

  async function handleApiKeySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError("Informe a chave de API.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await authService.verifyApiKey(apiKey.trim());
      loginWithApiKey(apiKey.trim());
      navigate("/articles");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode: LoginMode) {
    setMode(nextMode);
    setError(null);
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
          <h2>Painel administrativo</h2>
          <p>
            Gerencie os artigos, categorias e usuários responsáveis pelo conteúdo exibido no
            aplicativo Minha Saúde Feminina.
          </p>
        </div>
        <div className="login-hero-footer">© {new Date().getFullYear()} Minha Saúde Feminina</div>
      </div>

      <div className="login-panel">
        <div className="login-card">
          <h1>Bem-vinda de volta</h1>
          <p className="subtitle">Entre com suas credenciais para acessar o painel.</p>

          <div className="login-mode-switch" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "credentials"}
              className={mode === "credentials" ? "login-mode-btn active" : "login-mode-btn"}
              onClick={() => switchMode("credentials")}
            >
              Email e senha
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "apiKey"}
              className={mode === "apiKey" ? "login-mode-btn active" : "login-mode-btn"}
              onClick={() => switchMode("apiKey")}
            >
              Chave de API
            </button>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <AlertIcon />
              {error}
            </div>
          )}

          {mode === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit} noValidate>
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

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ width: "100%", padding: "12px 16px" }}
              >
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
          ) : (
            <form onSubmit={handleApiKeySubmit} noValidate>
              <label className="field">
                <span>Chave de API (x-api-key)</span>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="admin-secret-key"
                  autoFocus
                  autoComplete="off"
                />
              </label>
              <p className="muted" style={{ fontSize: "13px", marginTop: "-8px", marginBottom: "18px" }}>
                Usada por integrações e scripts. Enviada como header <code>x-api-key</code> em cada requisição.
              </p>

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ width: "100%", padding: "12px 16px" }}
              >
                {submitting ? (
                  <>
                    <span className="spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.4)" }} />
                    Verificando...
                  </>
                ) : (
                  "Entrar com a chave"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
