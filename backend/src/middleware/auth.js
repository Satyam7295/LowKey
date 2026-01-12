import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authorization token missing"));
  }

  const token = authHeader.split(" ")[1];
  try {
    // Decode token; caller can later load full user record if needed
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, roles: payload.roles || [] };
    return next();
  } catch (err) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}
