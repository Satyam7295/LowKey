import { ApiError } from "../utils/apiError.js";

export function notFound(req, res, next) {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const payload = {
    success: false,
    message
  };

  if (req.app.get("env") === "development") {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}
