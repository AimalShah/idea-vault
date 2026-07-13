import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lightbulb } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Lightbulb size={48} color="#1d9bf0" />
      </div>
      <h2>Sign in to IdeaVault</h2>
      <p className="subtitle">Share ideas, vote, and discuss</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit">Sign in</button>
      </form>
      <p className="switch-link">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}
