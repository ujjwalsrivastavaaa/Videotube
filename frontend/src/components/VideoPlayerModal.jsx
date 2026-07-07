import React, { useState, useEffect } from 'react';
import { X, Eye, Calendar, ThumbsUp, ThumbsDown, Trash2, Send, AlertCircle, MessageSquare } from 'lucide-react';
import { apiRequest } from '../utils/api';

const VideoPlayerModal = ({ video, isOpen, onClose, currentUser }) => {
  if (!isOpen || !video) return null;

  // Likes & Dislikes state
  const [likesCount, setLikesCount] = useState(video.likes?.length || 0);
  const [dislikesCount, setDislikesCount] = useState(video.dislikes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Subscription state
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch comments and initialize likes states
  useEffect(() => {
    if (!video?._id) return;

    // Reset counts and states based on current video data
    setLikesCount(video.likes?.length || 0);
    setDislikesCount(video.dislikes?.length || 0);
    
    const userId = currentUser?._id;
    setIsLiked(Array.isArray(video.likes) && video.likes.some(id => id.toString() === userId?.toString()));
    setIsDisliked(Array.isArray(video.dislikes) && video.dislikes.some(id => id.toString() === userId?.toString()));

    // Fetch comments from backend
    const fetchComments = async () => {
      setCommentsLoading(true);
      setCommentsError('');
      try {
        const response = await apiRequest(`/comments/${video._id}`, { method: 'GET' });
        if (response && response.data) {
          setComments(response.data);
        }
      } catch (err) {
        console.error("Failed to load comments:", err.message);
        setCommentsError("Could not load comments.");
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();

    // Fetch channel stats
    const fetchChannelStats = async () => {
      if (!video.owner?.username) return;
      setStatsLoading(true);
      try {
        const response = await apiRequest(`/users/c/${video.owner.username}`, { method: 'GET' });
        if (response && response.data) {
          setSubscribersCount(response.data.subscribersCount || 0);
          setIsSubscribed(response.data.isSubscribed || false);
        }
      } catch (err) {
        console.error("Failed to load channel stats:", err.message);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchChannelStats();
  }, [video, currentUser]);

  const handleToggleSubscribe = async () => {
    const ownerId = video.owner?._id || video.owner;
    if (!ownerId) return;

    try {
      const response = await apiRequest(`/users/toggle-subscribe/${ownerId}`, { method: 'POST' });
      if (response && response.data) {
        const subscribed = response.data.isSubscribed;
        setIsSubscribed(subscribed);
        setSubscribersCount(prev => subscribed ? prev + 1 : Math.max(0, prev - 1));
      }
    } catch (err) {
      alert(err.message || "Failed to toggle subscription");
    }
  };

  const handleToggleLike = async () => {
    try {
      const response = await apiRequest(`/videos/${video._id}/toggle-like`, { method: 'POST' });
      if (response && response.data) {
        const { likesCount, dislikesCount, isLiked, isDisliked } = response.data;
        setLikesCount(likesCount);
        setDislikesCount(dislikesCount);
        setIsLiked(isLiked);
        setIsDisliked(isDisliked);
      }
    } catch (err) {
      console.error("Failed to toggle like:", err.message);
    }
  };

  const handleToggleDislike = async () => {
    try {
      const response = await apiRequest(`/videos/${video._id}/toggle-dislike`, { method: 'POST' });
      if (response && response.data) {
        const { likesCount, dislikesCount, isLiked, isDisliked } = response.data;
        setLikesCount(likesCount);
        setDislikesCount(dislikesCount);
        setIsLiked(isLiked);
        setIsDisliked(isDisliked);
      }
    } catch (err) {
      console.error("Failed to toggle dislike:", err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setCommentSubmitting(true);
    try {
      const response = await apiRequest(`/comments/${video._id}`, {
        method: 'POST',
        body: JSON.stringify({ content: newCommentText })
      });
      if (response && response.data) {
        // Prepend comment to show immediately on top
        setComments(prev => [response.data, ...prev]);
        setNewCommentText('');
      }
    } catch (err) {
      alert(err.message || "Failed to post comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await apiRequest(`/comments/${commentId}`, { method: 'DELETE' });
      // Remove comment from local list
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      alert(err.message || "Failed to delete comment");
    }
  };

  const joinedDate = video.createdAt
    ? new Date(video.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="auth-card">
        {/* Close and Title */}
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%' }}>
            {video.title}
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Video Player */}
        <div style={styles.playerContainer}>
          <video
            src={video.videoFile}
            controls
            autoPlay
            style={styles.videoPlayer}
            poster={video.thumbnail}
          />
        </div>

        {/* Action Row: Likes & Dislikes */}
        <div style={styles.actionsBar}>
          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <Eye size={14} />
              <span>{video.views} views</span>
            </div>
            <div style={styles.metaItem}>
              <Calendar size={14} />
              <span>Published on {joinedDate}</span>
            </div>
          </div>

          <div style={styles.likeDislikeGroup}>
            <button 
              onClick={handleToggleLike} 
              style={{ ...styles.actionBtn, color: isLiked ? 'var(--primary)' : 'var(--text-secondary)' }}
              title="Like Video"
            >
              <ThumbsUp size={16} fill={isLiked ? "var(--primary)" : "none"} />
              <span>{likesCount}</span>
            </button>

            <button 
              onClick={handleToggleDislike} 
              style={{ ...styles.actionBtn, color: isDisliked ? 'var(--secondary)' : 'var(--text-secondary)' }}
              title="Dislike Video"
            >
              <ThumbsDown size={16} fill={isDisliked ? "var(--secondary)" : "none"} />
              <span>{dislikesCount}</span>
            </button>
          </div>
        </div>

        {/* Description Box */}
        <div style={styles.descriptionBox}>
          {/* Owner details */}
          <div style={styles.ownerRow}>
            <img
              src={video.owner?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"}
              alt="Owner Avatar"
              style={styles.ownerAvatar}
            />
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{video.owner?.fullName || 'Anonymous'}</h4>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>@{video.owner?.username || 'unknown'}</p>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {statsLoading ? 'Loading subscribers...' : `${subscribersCount} subscribers`}
              </span>
            </div>
            {currentUser && video.owner && (video.owner._id ? video.owner._id.toString() !== currentUser._id.toString() : video.owner.toString() !== currentUser._id.toString()) ? (
              <button
                onClick={handleToggleSubscribe}
                style={{
                  ...styles.subscribeBtn,
                  background: isSubscribed ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  border: isSubscribed ? '1px solid var(--border-glass)' : 'none',
                  color: '#fff'
                }}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '4px 8px', borderRadius: '4px' }}>Your Channel</span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '12px', whiteSpace: 'pre-line' }}>
            {video.description}
          </p>
        </div>

        {/* Comment Section */}
        <div style={styles.commentsSection}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} />
            <span>Comments ({comments.length})</span>
          </h3>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} style={styles.commentForm}>
            <input
              type="text"
              className="form-input"
              placeholder="Add a public comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              disabled={commentSubmitting}
              style={{ flexGrow: 1 }}
            />
            <button type="submit" className="btn-primary" disabled={commentSubmitting || !newCommentText.trim()} style={styles.commentSendBtn}>
              <Send size={14} />
            </button>
          </form>

          {/* Comments List */}
          {commentsLoading ? (
            <div className="loader-container" style={{ padding: '20px' }}>
              <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
            </div>
          ) : commentsError ? (
            <div className="alert alert-danger" style={{ fontSize: '12px', padding: '8px 12px' }}>{commentsError}</div>
          ) : comments.length > 0 ? (
            <div style={styles.commentsList}>
              {comments.map(comment => {
                const commentDate = comment.createdAt 
                  ? new Date(comment.createdAt).toLocaleDateString()
                  : 'just now';

                // Check comment ownership
                const isCommentOwner = comment.owner?._id 
                  ? comment.owner._id.toString() === currentUser?._id?.toString()
                  : comment.owner?.toString() === currentUser?._id?.toString();

                return (
                  <div key={comment._id} style={styles.commentItem}>
                    <img
                      src={comment.owner?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80"}
                      alt="Avatar"
                      style={styles.commentAvatar}
                    />
                    <div style={styles.commentBody}>
                      <div style={styles.commentMeta}>
                        <span style={styles.commentAuthor}>@{comment.owner?.username || 'unknown'}</span>
                        <span style={styles.commentDate}>{commentDate}</span>
                      </div>
                      <p style={styles.commentContent}>{comment.content}</p>
                    </div>

                    {isCommentOwner && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        style={styles.commentDeleteBtn}
                        title="Delete Comment"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={styles.noCommentsText}>No comments yet. Start the conversation!</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '24px'
  },
  modal: {
    width: '100%',
    maxWidth: '760px',
    padding: '24px',
    borderRadius: '16px',
    position: 'relative',
    maxHeight: '92vh',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '12px',
    marginBottom: '16px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-smooth)'
  },
  playerContainer: {
    aspectRatio: '16/9',
    width: '100%',
    backgroundColor: '#000',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid var(--border-glass)'
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  actionsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '16px',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '16px'
  },
  metaRow: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  likeDislikeGroup: {
    display: 'flex',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid var(--border-glass)'
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'var(--transition-smooth)'
  },
  descriptionBox: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-glass)',
    padding: '16px',
    borderRadius: '10px',
    marginBottom: '24px',
    textAlign: 'left'
  },
  ownerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '12px',
    marginBottom: '4px'
  },
  ownerAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--primary)'
  },
  ownerInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  commentsSection: {
    textAlign: 'left'
  },
  commentForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  commentSendBtn: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    maxHeight: '300px',
    overflowY: 'auto',
    paddingRight: '6px'
  },
  commentItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.01)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-glass)',
    position: 'relative',
    alignItems: 'flex-start'
  },
  commentAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid var(--border-glass)'
  },
  commentBody: {
    flexGrow: 1
  },
  commentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  },
  commentAuthor: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  commentDate: {
    fontSize: '10px',
    color: 'var(--text-muted)'
  },
  commentContent: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0
  },
  commentDeleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'var(--transition-smooth)',
    alignSelf: 'center'
  },
  noCommentsText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    padding: '20px'
  },
  subscribeBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    fontFamily: 'var(--font-heading)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default VideoPlayerModal;
