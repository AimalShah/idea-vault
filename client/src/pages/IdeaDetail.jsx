import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function IdeaDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const fetchIdea = async () => {
    const res = await axios.get(`/api/ideas/${id}`);
    setIdea(res.data.idea);
    setLoading(false);
  };

  const fetchComments = async () => {
    const res = await axios.get(`/api/ideas/${id}/comments`);
    setComments(res.body.comments);
  };

  const fetchUserVote = async () => {
    try {
      const res = await axios.get(`/api/ideas/${id}/votes/me`);
      setUserVote(res.data.vote?.value || null);
    } catch {
      setUserVote(null);
    }
  };

  useEffect(() => {
    fetchIdea();
    fetchComments();
    if (user) fetchUserVote();
  }, [id, user]);

  const vote = async (value) => {
    await axios.post(`/api/ideas/${id}/votes`, { value });
    fetchIdea();
    fetchUserVote();
  };

  const removeVote = async () => {
    await axios.delete(`/api/ideas/${id}/votes`);
    fetchIdea();
    setUserVote(null);
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await axios.post(`/api/ideas/${id}/comments`, { text: commentText });
    setCommentText("");
    fetchComments();
  };

  const updateComment = async (commentId) => {
    await axios.patch(`/api/ideas/${id}/comments/${commentId}`, { text: editText });
    setEditingId(null);
    fetchComments();
  };

  const deleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    await axios.delete(`/api/ideas/${id}/comments/${commentId}`);
    fetchComments();
  };

  if (loading) return <p>Loading...</p>;
  if (!idea) return <p>Idea not found</p>;

  const isAuthor = user?.id === idea.author?._id;
  const canVote = user && !isAuthor && idea.status === "open";

  return (
    <div className="idea-detail">
      <div className="idea-header">
        <h2>{idea.title}</h2>
        <span className={`status-badge ${idea.status}`}>{idea.status}</span>
      </div>
      <p className="idea-author">by {idea.author?.name}</p>
      <p className="idea-description">{idea.description}</p>

      {canVote && (
        <div className="vote-buttons">
          <button
            className={`vote-btn good ${userVote === "good" ? "active" : ""}`}
            onClick={() => (userVote === "good" ? removeVote() : vote("good"))}
          >
            Good
          </button>
          <button
            className={`vote-btn bad ${userVote === "bad" ? "active" : ""}`}
            onClick={() => (userVote === "bad" ? removeVote() : vote("bad"))}
          >
            Bad
          </button>
        </div>
      )}

      <div className="idea-score">
        <strong>Score:</strong> {idea.score.good} good / {idea.score.bad} bad ({idea.score.percentage}%)
      </div>

      {isAuthor && (
        <button onClick={async () => {
          const newStatus = idea.status === "open" ? "closed" : "open";
          await axios.patch(`/api/ideas/${id}`, { status: newStatus });
          fetchIdea();
        }} className="btn" style={{ marginBottom: 20 }}>
          {idea.status === "open" ? "Close Idea" : "Reopen Idea"}
        </button>
      )}

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        
        <form onSubmit={addComment} className="comment-form">
          <textarea
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
          />
          <button type="submit" className="btn">Post Comment</button>
        </form>

        <div className="comment-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment">
              {editingId === comment._id ? (
                <div className="comment-edit">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                  />
                  <div className="comment-edit-actions">
                    <button onClick={() => updateComment(comment._id)} className="btn">Save</button>
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="comment-text">{comment.text}</p>
                  <div className="comment-meta">
                    <span>{comment.author?.name}</span>
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    {user?.id === comment.author?._id && (
                      <button onClick={() => { setEditingId(comment._id); setEditText(comment.text); }}>
                        Edit
                      </button>
                    )}
                    {isAuthor && (
                      <button onClick={() => deleteComment(comment._id)} className="delete-btn">
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
