import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThumbsUp, ThumbsDown, MessageCircle, Trash2, Edit2, ArrowLeft } from "lucide-react";
import axios from "axios";

export default function IdeaDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchIdea = async () => {
    try {
      const res = await axios.get(`/api/ideas/${id}`);
      setIdea(res.data.idea);
    } catch (err) {
      console.error("Failed to fetch idea:", err);
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/ideas/${id}/comments`);
      setComments(res.body.comments);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
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
    try {
      await axios.post(`/api/ideas/${id}/votes`, { value });
      fetchIdea();
      fetchUserVote();
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const removeVote = async () => {
    try {
      await axios.delete(`/api/ideas/${id}/votes`);
      fetchIdea();
      setUserVote(null);
    } catch (err) {
      console.error("Failed to remove vote:", err);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await axios.post(`/api/ideas/${id}/comments`, { text: commentText });
      setCommentText("");
      fetchComments();
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
    setSubmitting(false);
  };

  const updateComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await axios.patch(`/api/ideas/${id}/comments/${commentId}`, { text: editText });
      setEditingId(null);
      fetchComments();
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/ideas/${id}/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const toggleStatus = async () => {
    try {
      const newStatus = idea.status === "open" ? "closed" : "open";
      await axios.patch(`/api/ideas/${id}`, { status: newStatus });
      fetchIdea();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!idea) return <div className="empty-state">Idea not found</div>;

  const isAuthor = user?.id === idea.author?._id;
  const canVote = user && !isAuthor && idea.status === "open";

  return (
    <div className="idea-detail">
      <div className="main-header" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#e7e9ea" }}>
          <ArrowLeft size={20} />
        </button>
        <h2>Idea</h2>
      </div>

      <div style={{ padding: "16px" }}>
        <div className="idea-detail-header">
          <div className="idea-detail-avatar">{idea.author?.name?.[0]?.toUpperCase()}</div>
          <div className="idea-detail-meta">
            <div className="idea-detail-author">
              <span>{idea.author?.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span className={`status-badge ${idea.status}`}>{idea.status}</span>
              {isAuthor && (
                <button onClick={toggleStatus} className="btn-outline" style={{ fontSize: 12, padding: "4px 12px" }}>
                  {idea.status === "open" ? "Close" : "Reopen"}
                </button>
              )}
            </div>
          </div>
        </div>

        <h1 className="idea-detail-title">{idea.title}</h1>
        <p className="idea-detail-description">{idea.description}</p>

        <div className="idea-detail-score">
          <div><span>{idea.score.good}</span> good</div>
          <div><span>{idea.score.bad}</span> bad</div>
          <div><span>{idea.score.percentage}%</span> approval</div>
        </div>

        {canVote && (
          <div className="vote-buttons">
            <button className={`vote-btn good ${userVote === "good" ? "active" : ""}`} onClick={() => userVote === "good" ? removeVote() : vote("good")}>
              <ThumbsUp size={16} /> Good
            </button>
            <button className={`vote-btn bad ${userVote === "bad" ? "active" : ""}`} onClick={() => userVote === "bad" ? removeVote() : vote("bad")}>
              <ThumbsDown size={16} /> Bad
            </button>
          </div>
        )}

        <div className="comments-section">
          <h3><MessageCircle size={20} style={{ marginRight: 8, verticalAlign: "middle" }} /> Comments ({comments.length})</h3>

          <form onSubmit={addComment} className="comment-form">
            <div className="comment-form-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="comment-form-input">
              <textarea placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
              <div className="comment-form-actions">
                <button type="submit" className="btn-primary" disabled={!commentText.trim() || submitting}>
                  {submitting ? "Posting..." : "Reply"}
                </button>
              </div>
            </div>
          </form>

          <div className="comment-list">
            {comments.map((comment) => (
              <div key={comment._id} className="comment">
                <div className="comment-avatar">{comment.author?.name?.[0]?.toUpperCase()}</div>
                <div className="comment-body">
                  {editingId === comment._id ? (
                    <div className="comment-edit">
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} />
                      <div className="comment-edit-actions">
                        <button onClick={() => updateComment(comment._id)} className="btn-primary" style={{ fontSize: 13, padding: "6px 14px" }}>Save</button>
                        <button onClick={() => setEditingId(null)} className="btn-outline" style={{ fontSize: 13, padding: "6px 14px" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="comment-meta">
                        <span className="name">{comment.author?.name}</span>
                        <span className="time">· {new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      <div className="comment-actions">
                        {user?.id === comment.author?._id && (
                          <button onClick={() => { setEditingId(comment._id); setEditText(comment.text); }}>
                            <Edit2 size={14} /> Edit
                          </button>
                        )}
                        {isAuthor && (
                          <button onClick={() => deleteComment(comment._id)} className="delete">
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="empty-state" style={{ padding: 20 }}>No comments yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
