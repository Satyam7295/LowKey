import { registerUser, loginUser } from "../services/authService.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

export async function register(req, res) {
  const { name, username, email, password } = req.body;
  const result = await registerUser({ name, username, email, password });
  res.status(201).json(result);
}

export async function login(req, res) {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });
  res.status(200).json(result);
}

export async function me(req, res) {
  const userId = req.user.id;
  const user = await User.findById(userId);
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    user: user.toJSON()
  });
}
