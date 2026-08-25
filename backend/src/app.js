const express = require("express");
const cors = require("cors");
const articlesRouter = require("./routes/articles");
const authorsRouter = require("./routes/authors");
const categoriesRouter = require("./routes/categories");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const { sendError, ApiError } = require("./utils/api-error");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const api = express.Router();
  api.use("/articles", articlesRouter);
  api.use("/authors", authorsRouter);
  api.use("/categories", categoriesRouter);
  api.use("/auth", authRouter);
  api.use("/users", usersRouter);

  app.use("/api/v1", api);

  app.get("/", (req, res) => {
    res.json({ name: "minha-saude-feminina-api", status: "ok" });
  });

  app.use((req, res, next) => {
    next(new ApiError(404, "NOT_FOUND", "Rota nao encontrada."));
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    sendError(res, err);
  });

  return app;
}

module.exports = createApp;
