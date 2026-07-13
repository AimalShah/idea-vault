import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/users/${id}/ideas`)
      .then((res) => setIdeas(res.data.ideas))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;

  const profileUser = ideas[0]?.author || currentUser;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>{profileUser?.name}</h2>
        <p className="profile-count">{ideas.length} idea{ideas.length !== 1 ? "s" : ""}</p>
      </div>

      {ideas.length === 0 ? (
        <p>No ideas posted yet.</p>
      ) : (
        <div className="idea-list">
          {ideas.map((idea) => (
            <Link to={`/ideas/${idea._id}`} key={idea._id} className="idea-card">
              <div className="idea-card-header">
                <h3>{idea.title}</h3>
                <span className={`status-badge ${idea.status}`}>{idea.status}</span>
              </div>
              <div className="idea-card-footer">
                <span className="score">
                  {idea.score.good} good / {idea.score.bad} bad ({idea.score.percentage}%)
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
