class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function sendError(res, err) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.code,
    });
  }
  console.error(err);
  return res.status(500).json({
    error: true,
    message: "Erro interno do servidor.",
    code: "INTERNAL_ERROR",
  });
}

module.exports = { ApiError, sendError };
