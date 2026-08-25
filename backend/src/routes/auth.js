const express = require("express");
const bcrypt = require("bcryptjs");
const store = require("../data/store");
const adminAuth = require("../middleware/admin-auth");
const { ApiError } = require("../utils/api-error");

const router = express.Router();

function sanitizeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /auth/login
router.post("/login", (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      throw new ApiError(422, "VALIDATION_ERROR", "Informe email e senha.");
    }

    const { db } = store;
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Email ou senha invalidos.");
    }

    const token = store.generateToken();
    db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
    store.save();

    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
router.post("/logout", (req, res) => {
  const authHeader = req.header("authorization") || "";
  const [, token] = authHeader.split(" ");

  if (token) {
    const { db } = store;
    const index = db.sessions.findIndex((s) => s.token === token);
    if (index !== -1) {
      db.sessions.splice(index, 1);
      store.save();
    }
  }

  res.status(204).send();
});

// GET /auth/me (admin) — valida o token atual e retorna o usuario logado
router.get("/me", adminAuth, (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "UNAUTHORIZED", "Sessao invalida."));
  }
  res.json(sanitizeUser(req.user));
});

module.exports = router;
