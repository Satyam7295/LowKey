import dotenv from "dotenv";

// Load environment variables early
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/lowkey",
  jwtSecret: process.env.JWT_SECRET || "change_me",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
};
