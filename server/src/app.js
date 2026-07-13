import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./auth/auth.routes.js";
import ideaRoutes from "./ideas/idea.routes.js";
import voteRoutes from "./votes/vote.routes.js";
import commentRoutes from "./comments/comment.routes.js";
import userRoutes from "./users/user.routes.js";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/ideas", voteRoutes);
app.use("/api/ideas", commentRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ error: { message } });
});

export default app;
