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

function validateSources(sources) {
  if (sources === undefined) return [];
  if (!Array.isArray(sources)) {
    throw new ApiError(422, "VALIDATION_ERROR", "O campo 'sources' deve ser um array.");
  }
  return sources.map((source) => {
    if (!source || typeof source.title !== "string" || !source.title.trim()) {
      throw new ApiError(422, "VALIDATION_ERROR", "Cada fonte precisa de um 'title'.");
    }
    if (!source.url || typeof source.url !== "string" || !source.url.trim()) {
      throw new ApiError(422, "VALIDATION_ERROR", "Cada fonte precisa de uma 'url'.");
    }
    return {
      id: source.id || store.generateId("src"),
      title: source.title.trim(),
      description: typeof source.description === "string" ? source.description.trim() : "",
      url: source.url.trim(),
    };
  });
}

function validateCreatePayload(body) {
  const { db } = store;

  if (!body || typeof body.title !== "string" || !body.title.trim()) {
    throw new ApiError(422, "VALIDATION_ERROR", "O campo 'title' e obrigatorio.");
  }
  if (!body.summary || typeof body.summary !== "string" || !body.summary.trim()) {
    throw new ApiError(422, "VALIDATION_ERROR", "O campo 'summary' e obrigatorio.");
  }
  if (!body.content || typeof body.content !== "string" || !body.content.trim()) {
    throw new ApiError(422, "VALIDATION_ERROR", "O campo 'content' e obrigatorio.");
  }
  if (!body.categoryId || typeof body.categoryId !== "string") {
    throw new ApiError(422, "VALIDATION_ERROR", "O campo 'categoryId' e obrigatorio.");
  }
  if (!db.categories.some((c) => c.id === body.categoryId)) {
    throw new ApiError(422, "VALIDATION_ERROR", "categoryId informado nao existe.");
  }
  if (!body.authorId || typeof body.authorId !== "string") {
    throw new ApiError(422, "VALIDATION_ERROR", "O campo 'authorId' e obrigatorio.");
  }
  if (!db.authors.some((a) => a.id === body.authorId)) {
    throw new ApiError(422, "VALIDATION_ERROR", "authorId informado nao existe.");
  }
}

function enrichArticle(article) {
  const { db } = store;
  const author = article.authorId ? db.authors.find((a) => a.id === article.authorId) : undefined;
  return {
    ...article,
    author: author
      ? { id: author.id, name: author.name, institution: author.institution, bio: author.bio }
      : undefined,
  };
}

// GET /articles
router.get("/", (req, res) => {
  const { db } = store;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.max(parseInt(req.query.pageSize, 10) || 20, 1);
  const query = (req.query.q || req.query.search || "").toString().trim().toLowerCase();
  const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;

  let results = [...db.articles];

  if (categoryId) {
    results = results.filter((a) => a.categoryId === categoryId);
  }

  if (query) {
    results = results.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.summary.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query)
    );
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = results.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const start = (page - 1) * pageSize;
  const pageItems = results.slice(start, start + pageSize).map(enrichArticle);

  res.json({
    data: pageItems,
    pagination: { page, pageSize, total, totalPages },
  });
});

// GET /articles/:id
router.get("/:id", (req, res, next) => {
  const { db } = store;
  const article = db.articles.find((a) => a.id === req.params.id);

  if (!article) {
    return next(new ApiError(404, "ARTICLE_NOT_FOUND", "Artigo nao encontrado."));
  }

  res.json(enrichArticle(article));
});

// POST /articles (admin)
router.post("/", adminAuth, (req, res, next) => {
  try {
    validateCreatePayload(req.body);
    const { db } = store;

    const slug = req.body.slug ? slugify(req.body.slug) : slugify(req.body.title);
    let uniqueSlug = slug;
    let counter = 2;
    while (db.articles.some((a) => a.slug === uniqueSlug)) {
      uniqueSlug = `${slug}-${counter}`;
      counter += 1;
    }

    const now = new Date().toISOString();
    const article = {
      id: store.generateId("art"),
      title: req.body.title.trim(),
      slug: uniqueSlug,
      summary: req.body.summary.trim(),
      content: req.body.content.trim(),
      categoryId: req.body.categoryId,
      authorId: req.body.authorId,
      sources: validateSources(req.body.sources),
      createdAt: now,
      updatedAt: now,
    };

    db.articles.push(article);
    store.save();

    res.status(201).json(enrichArticle(article));
  } catch (err) {
    next(err);
  }
});

// PATCH /articles/:id (admin)
router.patch("/:id", adminAuth, (req, res, next) => {
  try {
    const { db } = store;
    const article = db.articles.find((a) => a.id === req.params.id);

    if (!article) {
      throw new ApiError(404, "ARTICLE_NOT_FOUND", "Artigo nao encontrado.");
    }

    const body = req.body || {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || !body.title.trim()) {
        throw new ApiError(422, "VALIDATION_ERROR", "O campo 'title' deve ser uma string nao vazia.");
      }
      article.title = body.title.trim();
    }

    if (body.summary !== undefined) {
      if (typeof body.summary !== "string" || !body.summary.trim()) {
        throw new ApiError(422, "VALIDATION_ERROR", "O campo 'summary' deve ser uma string nao vazia.");
      }
      article.summary = body.summary.trim();
    }

    if (body.content !== undefined) {
      if (typeof body.content !== "string" || !body.content.trim()) {
        throw new ApiError(422, "VALIDATION_ERROR", "O campo 'content' deve ser uma string nao vazia.");
      }
      article.content = body.content.trim();
    }

    if (body.categoryId !== undefined) {
      if (typeof body.categoryId !== "string" || !db.categories.some((c) => c.id === body.categoryId)) {
        throw new ApiError(422, "VALIDATION_ERROR", "categoryId informado nao existe.");
      }
      article.categoryId = body.categoryId;
    }

    if (body.authorId !== undefined) {
      if (typeof body.authorId !== "string" || !db.authors.some((a) => a.id === body.authorId)) {
        throw new ApiError(422, "VALIDATION_ERROR", "authorId informado nao existe.");
      }
      article.authorId = body.authorId;
    }

    if (body.sources !== undefined) {
      article.sources = validateSources(body.sources);
    }

    if (body.slug !== undefined) {
      if (typeof body.slug !== "string" || !body.slug.trim()) {
        throw new ApiError(422, "VALIDATION_ERROR", "O campo 'slug' deve ser uma string nao vazia.");
      }
      const newSlug = slugify(body.slug);
      if (db.articles.some((a) => a.slug === newSlug && a.id !== article.id)) {
        throw new ApiError(409, "SLUG_ALREADY_EXISTS", "Ja existe um artigo com este slug.");
      }
      article.slug = newSlug;
    }

    article.updatedAt = new Date().toISOString();
    store.save();

    res.json(enrichArticle(article));
  } catch (err) {
    next(err);
  }
});

// DELETE /articles/:id (admin)
router.delete("/:id", adminAuth, (req, res, next) => {
  const { db } = store;
  const index = db.articles.findIndex((a) => a.id === req.params.id);

  if (index === -1) {
    return next(new ApiError(404, "ARTICLE_NOT_FOUND", "Artigo nao encontrado."));
  }

  db.articles.splice(index, 1);
  store.save();

  res.status(204).send();
});

module.exports = router;
