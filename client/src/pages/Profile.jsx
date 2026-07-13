import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThumbsUp, ThumbsDown, ArrowLeft } from "lucide-react";
import axios from "axios";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/users/${id}/ideas`)
      .then((res) => {
        setIdeas(res.data.ideas);
        if (res.data.ideas.length > 0) {
          setProfileUser(res.data.ideas[0].author);
        } else {
          setProfileUser({ name: currentUser?.name, _id: id });
        }
      })
      .finally(() => setLoading(false));
  }, [id, currentUser]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="main-header" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => window.history.back()} style={{ background: "none", border: "none", color: "#e7e9ea" }}>
          <ArrowLeft size={20} />
        </button>
        <h2>{profileUser?.name}</h2>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">{profileUser?.name?.[0]?.toUpperCase()}</div>
        <div className="profile-name">{profileUser?.name}</div>
        <div className="profile-stats">
          <div><span>{ideas.length}</span> ideas</div>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="empty-state">No ideas posted yet</div>
      ) : (
        <div className="idea-list">
          {ideas.map((idea) => (
            <Link to={`/ideas/${idea._id}`} key={idea._id} className="idea-card">
              <div className="idea-card-header">
                <h3>{idea.title}</h3>
                <span className={`status-badge ${idea.status}`}>{idea.status}</span>
              </div>
              <div className="idea-card-footer">
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <ThumbsUp size={14} /> {idea.score.good}
                  <span style={{ margin: "0 4px" }}>/</span>
                  <ThumbsDown size={14} /> {idea.score.bad}
                </span>
                <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
