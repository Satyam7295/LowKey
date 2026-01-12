import { registerUser, loginUser } from "../services/authService.js";

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
