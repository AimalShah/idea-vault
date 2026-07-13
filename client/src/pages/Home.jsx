import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const fetchIdeas = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("sort", sort);
    params.set("status", status);
    if (search) params.set("search", search);
    
    const res = await axios.get(`/api/ideas?${params}`);
    setIdeas(res.data.ideas);
    setLoading(false);
  };

  useEffect(() => {
    const debounce = setTimeout(fetchIdeas, 300);
    return () => clearTimeout(debounce);
  }, [sort, status, search]);

  return (
    <div>
      <div className="home-header">
        <h2>Ideas</h2>
        <Link to="/ideas/new" className="btn">New Idea</Link>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label>Sort:</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="popular">Most Voted</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <div className="status-tabs">
            {["all", "open", "closed"].map((s) => (
              <button
                key={s}
                className={`tab ${status === s ? "active" : ""}`}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group search">
          <input
            type="text"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading ideas...</p>
      ) : ideas.length === 0 ? (
        <p>No ideas found.</p>
      ) : (
        <div className="idea-list">
          {ideas.map((idea) => (
            <Link to={`/ideas/${idea._id}`} key={idea._id} className="idea-card">
              <div className="idea-card-header">
                <h3>{idea.title}</h3>
                <span className={`status-badge ${idea.status}`}>{idea.status}</span>
              </div>
              <p className="idea-excerpt">{idea.description.slice(0, 150)}...</p>
              <div className="idea-card-footer">
                <span className="score">
                  {idea.score.good} good / {idea.score.bad} bad ({idea.score.percentage}%)
                </span>
                <span className="author">by {idea.author?.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
