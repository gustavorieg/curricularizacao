const store = require("../data/store");
const { ApiError } = require("../utils/api-error");

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

function findActiveSession(token) {
  const { db } = store;
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return null;

  const isExpired = Date.now() - new Date(session.createdAt).getTime() > SESSION_TTL_MS;
  if (isExpired) return null;

  return session;
}

/**
 * Autentica requisicoes de administrador de duas formas:
 * 1. Header `x-api-key` correspondendo a ADMIN_API_KEY (uso por integracoes/scripts).
 * 2. Header `Authorization: Bearer <token>` de uma sessao valida (login de usuario).
 */
function adminAuth(req, res, next) {
  const configuredKey = process.env.ADMIN_API_KEY;
  const providedKey = req.header("x-api-key");

  if (configuredKey && providedKey && providedKey === configuredKey) {
    return next();
  }

  const authHeader = req.header("authorization") || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme === "Bearer" && token) {
    const session = findActiveSession(token);
    if (session) {
      const { db } = store;
      const user = db.users.find((u) => u.id === session.userId);
      if (user) {
        req.user = user;
        return next();
      }
    }
  }

  if (providedKey && !configuredKey) {
    return next(
      new ApiError(500, "ADMIN_API_KEY_NOT_CONFIGURED", "Chave de administrador nao configurada no servidor.")
    );
  }

  return next(new ApiError(401, "UNAUTHORIZED", "Autenticacao invalida ou ausente."));
}

module.exports = adminAuth;
