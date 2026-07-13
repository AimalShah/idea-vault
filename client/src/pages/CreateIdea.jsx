import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

export default function CreateIdea() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await axios.post("/api/ideas", form);
      navigate(`/ideas/${res.data.idea._id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to create idea");
    }
    setSubmitting(false);
  };

  return (
    <>
      <div className="main-header" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#e7e9ea" }}>
          <ArrowLeft size={20} />
        </button>
        <h2>New Idea</h2>
      </div>
      <div className="create-page">
        {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit} className="create-form">
          <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea placeholder="What's your idea?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="create-form-actions">
            <button type="submit" className="btn-primary" disabled={submitting || !form.title || !form.description}>
              {submitting ? "Posting..." : "Post Idea"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
