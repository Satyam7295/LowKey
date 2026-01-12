import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";

const app = express();

app.use(helmet());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ name: "LOWKEY API", status: "ok" });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
