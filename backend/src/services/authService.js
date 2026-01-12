import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/User.js";

function signToken(user) {
  return jwt.sign(
    { sub: user.id, roles: user.roles || ["user"] },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

function sanitize(userDoc) {
  return userDoc.toJSON();
}

export async function registerUser({ name, username, email, password }) {
  if (!username || !email || !password) {
    throw new ApiError(400, "username, email, and password are required");
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const field = existing.email === email ? "email" : "username";
    throw new ApiError(409, `${field} already in use`);
  }

  const user = await User.create({ name, username, email, password });
  const token = signToken(user);
  return { token, user: sanitize(user) };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const user = await User.findOne({ email }).select("+password +roles");
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = signToken(user);
  return { token, user: sanitize(user) };
}
