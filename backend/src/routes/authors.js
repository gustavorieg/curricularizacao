const express = require("express");
const store = require("../data/store");
const adminAuth = require("../middleware/admin-auth");
const { ApiError } = require("../utils/api-error");

const router = express.Router();

// GET /authors
router.get("/", (req, res) => {
  const { db } = store;
  res.json({ data: db.authors });
});

// POST /authors (admin)
router.post("/", adminAuth, (req, res, next) => {
  try {
    const { db } = store;
    const body = req.body || {};

    if (typeof body.name !== "string" || !body.name.trim()) {
      throw new ApiError(422, "VALIDATION_ERROR", "O campo 'name' e obrigatorio.");
    }

    const existing = db.authors.find((a) => a.name.trim().toLowerCase() === body.name.trim().toLowerCase());
    if (existing) {
      return res.status(200).json(existing);
    }

    const now = new Date().toISOString();
    const author = {
      id: store.generateId("auth"),
      name: body.name.trim(),
      institution: typeof body.institution === "string" ? body.institution.trim() : "",
      bio: typeof body.bio === "string" ? body.bio.trim() : "",
      createdAt: now,
      updatedAt: now,
    };

    db.authors.push(author);
    store.save();

    res.status(201).json(author);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
