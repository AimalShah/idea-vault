import { Router } from "express";
import User from "./user.model.js";
import { generateToken, setTokenCookie, clearTokenCookie } from "./auth.service.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: { message: "All fields are required" } });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: { message: "Email already in use" } });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { message: "Email and password are required" } });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: { message: "Invalid credentials" } });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: { message: "Not authenticated" } });
    }

    const jwt = await import("jsonwebtoken");
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: { message: "User not found" } });
    }

    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch {
    return res.status(401).json({ error: { message: "Invalid token" } });
  }
});

router.post("/logout", (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out" });
});

export default router;
