const express = require("express");
const bcrypt = require("bcryptjs");
const store = require("../data/store");
const adminAuth = require("../middleware/admin-auth");
const { ApiError } = require("../utils/api-error");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}
// Validation 
function validateCreatePayload(body, db) {
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    throw new ApiError(422, "VALIDATION_ERROR", "O campo 'name' e obrigatorio.");
  }
  if (!body.email || typeof body.email !== "string" || !EMAIL_REGEX.test(body.email.trim())) {
    throw new ApiError(422, "VALIDATION_ERROR", "Informe um 'email' valido.");
  }
  if (!body.password || typeof body.password !== "string" || body.password.length < 6) {
    throw new ApiError(422, "VALIDATION_ERROR", "A 'password' deve ter ao menos 6 caracteres.");
  }
  if (db.users.some((u) => u.email.toLowerCase() === body.email.trim().toLowerCase())) {
    throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "Ja existe um usuario com este email.");
  }
  if (body.role !== undefined && !["admin", "editor"].includes(body.role)) {
    throw new ApiError(422, "VALIDATION_ERROR", "O campo 'role' deve ser 'admin' ou 'editor'.");
  }
}

// GET /users | only admin
router.get("/", adminAuth, (req, res) => {
  const { db } = store;
  res.json({ data: db.users.map(sanitizeUser) });
});

// GET /users/:id | only admin
router.get("/:id", adminAuth, (req, res, next) => {
  const { db } = store;
  const user = db.users.find((u) => u.id === req.params.id);

  if (!user) {
    return next(new ApiError(404, "USER_NOT_FOUND", "Usuario nao encontrado."));
  }

  res.json(sanitizeUser(user));
});

// POST /users (admin)
router.post("/", adminAuth, (req, res, next) => {
  try {
    const { db } = store;
    validateCreatePayload(req.body, db);

    const now = new Date().toISOString();
    const user = {
      id: store.generateId("user"),
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      role: req.body.role || "editor",
      createdAt: now,
      updatedAt: now,
    };

    db.users.push(user);
    store.save();

    res.status(201).json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
});

// PATCH /users/:id (admin)
router.patch("/:id", adminAuth, (req, res, next) => {
  try {
    const { db } = store;
    const user = db.users.find((u) => u.id === req.params.id);

    if (!user) {
      throw new ApiError(404, "USER_NOT_FOUND", "Usuario nao encontrado.");
    }

    const body = req.body || {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        throw new ApiError(422, "VALIDATION_ERROR", "O campo 'name' deve ser uma string nao vazia.");
      }
      user.name = body.name.trim();
    }

    if (body.email !== undefined) {
      if (typeof body.email !== "string" || !EMAIL_REGEX.test(body.email.trim())) {
        throw new ApiError(422, "VALIDATION_ERROR", "Informe um 'email' valido.");
      }
      const newEmail = body.email.trim().toLowerCase();
      if (db.users.some((u) => u.email === newEmail && u.id !== user.id)) {
        throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "Ja existe um usuario com este email.");
      }
      user.email = newEmail;
    }

    if (body.role !== undefined) {
      if (!["admin", "editor"].includes(body.role)) {
        throw new ApiError(422, "VALIDATION_ERROR", "O campo 'role' deve ser 'admin' ou 'editor'.");
      }
      user.role = body.role;
    }

    if (body.password !== undefined) {
      if (typeof body.password !== "string" || body.password.length < 6) {
        throw new ApiError(422, "VALIDATION_ERROR", "A 'password' deve ter ao menos 6 caracteres.");
      }
      user.passwordHash = bcrypt.hashSync(body.password, 10);
    }

    user.updatedAt = new Date().toISOString();
    store.save();

    res.json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
});

// DELETE /users/:id (admin)
router.delete("/:id", adminAuth, (req, res, next) => {
  const { db } = store;
  const index = db.users.findIndex((u) => u.id === req.params.id);

  if (index === -1) {
    return next(new ApiError(404, "USER_NOT_FOUND", "Usuario nao encontrado."));
  }

  if (db.users.length === 1) {
    return next(new ApiError(409, "LAST_USER", "Nao e possivel remover o unico usuario cadastrado."));
  }

  db.users.splice(index, 1);
  db.sessions = db.sessions.filter((s) => s.userId !== req.params.id);
  store.save();

  res.status(204).send();
});

module.exports = router;
