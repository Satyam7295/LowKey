import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error", err);
    throw err;
  }
}
