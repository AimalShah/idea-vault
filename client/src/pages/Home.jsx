import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import axios from "axios";

export default function Home() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("sort", sort);
    params.set("status", status);
    if (search) params.set("search", search);
    const res = await axios.get(`/api/ideas?${params}`);
    setIdeas(res.data.ideas);
    setLoading(false);
  }, [sort, status, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchIdeas, 300);
    return () => clearTimeout(debounce);
  }, [fetchIdeas]);

  return (
    <>
      <div className="main-header">
        <h2>Home</h2>
      </div>

      <div className="filter-bar">
        <div className="status-tabs">
          {["all", "open", "closed"].map((s) => (
            <button key={s} className={`tab ${status === s ? "active" : ""}`} onClick={() => setStatus(s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Latest</option>
            <option value="popular">Top</option>
          </select>
        </div>
        <div className="filter-group search">
          <input type="text" placeholder="Search ideas" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : ideas.length === 0 ? (
        <div className="empty-state">No ideas found</div>
      ) : (
        <div className="idea-list">
          {ideas.map((idea) => (
            <Link to={`/ideas/${idea._id}`} key={idea._id} className="idea-card">
              <div className="idea-card-author">
                <span>{idea.author?.name}</span> posted an idea
              </div>
              <div className="idea-card-header">
                <h3>{idea.title}</h3>
                <span className={`status-badge ${idea.status}`}>{idea.status}</span>
              </div>
              <p className="idea-excerpt">{idea.description}</p>
              <div className="idea-card-footer">
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <ThumbsUp size={14} /> {idea.score.good}
                  <span style={{ margin: "0 4px" }}>/</span>
                  <ThumbsDown size={14} /> {idea.score.bad}
                </span>
                <span>{idea.score.percentage}% good</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
