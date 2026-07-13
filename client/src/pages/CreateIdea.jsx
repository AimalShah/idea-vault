import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateIdea() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/api/ideas", form);
      navigate(`/ideas/${res.data.idea._id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to create idea");
    }
  };

  return (
    <div className="auth-page">
      <h2>New Idea</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={6}
          required
        />
        <button type="submit">Create Idea</button>
      </form>
    </div>
  );
}
