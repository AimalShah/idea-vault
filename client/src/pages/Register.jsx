import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lightbulb } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Lightbulb size={48} color="#1d9bf0" />
      </div>
      <h2>Create your account</h2>
      <p className="subtitle">Join IdeaVault and start sharing ideas</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit">Create account</button>
      </form>
      <p className="switch-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
