const express = require("express");
const store = require("../data/store");
const adminAuth = require("../middleware/admin-auth");
const { ApiError } = require("../utils/api-error");

const router = express.Router();

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function validateCreatePayload(body) {
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    throw new ApiError(422, "VALIDATION_ERROR", "O campo 'name' e obrigatorio.");
  }
  if (!body.description || typeof body.description !== "string" || !body.description.trim()) {
    throw new ApiError(422, "VALIDATION_ERROR", "O campo 'description' e obrigatorio.");
  }
  if (body.slug !== undefined && typeof body.slug !== "string") {
    throw new ApiError(422, "VALIDATION_ERROR", "O campo 'slug' deve ser uma string.");
  }
  if (body.displayOrder !== undefined && typeof body.displayOrder !== "number") {
    throw new ApiError(422, "VALIDATION_ERROR", "O campo 'displayOrder' deve ser um numero.");
  }
}

// GET /categories
router.get("/", (req, res) => {
  const { db } = store;
  const sorted = [...db.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  res.json({ data: sorted });
});

// GET /categories/:idOrSlug
router.get("/:idOrSlug", (req, res, next) => {
  const { db } = store;
  const { idOrSlug } = req.params;
  const category = db.categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug);

  if (!category) {
    return next(new ApiError(404, "CATEGORY_NOT_FOUND", "Categoria nao encontrada."));
  }

  res.json(category);
});

// POST /categories (admin)
router.post("/", adminAuth, (req, res, next) => {
  try {
    validateCreatePayload(req.body);
    const { db } = store;

    const slug = req.body.slug ? slugify(req.body.slug) : slugify(req.body.name);

    if (db.categories.some((c) => c.slug === slug)) {
      throw new ApiError(409, "SLUG_ALREADY_EXISTS", "Ja existe uma categoria com este slug.");
    }

    const now = new Date().toISOString();
    const category = {
      id: store.generateId("cat"),
      name: req.body.name.trim(),
      slug,
      description: req.body.description.trim(),
      displayOrder: typeof req.body.displayOrder === "number" ? req.body.displayOrder : db.categories.length + 1,
      createdAt: now,
      updatedAt: now,
    };

    db.categories.push(category);
    store.save();

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

// PATCH /categories/:id (admin)
router.patch("/:id", adminAuth, (req, res, next) => {
  try {
    const { db } = store;
    const category = db.categories.find((c) => c.id === req.params.id);

    if (!category) {
      throw new ApiError(404, "CATEGORY_NOT_FOUND", "Categoria nao encontrada.");
    }

    const body = req.body || {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        throw new ApiError(422, "VALIDATION_ERROR", "O campo 'name' deve ser uma string nao vazia.");
      }
      category.name = body.name.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string" || !body.description.trim()) {
        throw new ApiError(422, "VALIDATION_ERROR", "O campo 'description' deve ser uma string nao vazia.");
      }
      category.description = body.description.trim();
    }

    if (body.displayOrder !== undefined) {
      if (typeof body.displayOrder !== "number") {
        throw new ApiError(422, "VALIDATION_ERROR", "O campo 'displayOrder' deve ser um numero.");
      }
      category.displayOrder = body.displayOrder;
    }

    if (body.slug !== undefined) {
      if (typeof body.slug !== "string" || !body.slug.trim()) {
        throw new ApiError(422, "VALIDATION_ERROR", "O campo 'slug' deve ser uma string nao vazia.");
      }
      const newSlug = slugify(body.slug);
      if (db.categories.some((c) => c.slug === newSlug && c.id !== category.id)) {
        throw new ApiError(409, "SLUG_ALREADY_EXISTS", "Ja existe uma categoria com este slug.");
      }
      category.slug = newSlug;
    }

    category.updatedAt = new Date().toISOString();
    store.save();

    res.json(category);
  } catch (err) {
    next(err);
  }
});

// DELETE /categories/:id (admin)
router.delete("/:id", adminAuth, (req, res, next) => {
  const { db } = store;
  const index = db.categories.findIndex((c) => c.id === req.params.id);

  if (index === -1) {
    return next(new ApiError(404, "CATEGORY_NOT_FOUND", "Categoria nao encontrada."));
  }

  db.categories.splice(index, 1);
  store.save();

  res.status(204).send();
});

module.exports = router;
