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
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      alert(err.message || "Failed to delete comment");
    }
  };

  const joinedDate = video.createdAt
    ? new Date(video.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="fixed inset-0 bg-brand-text/45 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-brand-card border border-brand-border rounded-md p-6 md:p-8 shadow-lg relative max-h-[92vh] overflow-y-auto text-left flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <h2 className="font-extrabold text-sm sm:text-base text-brand-text truncate max-w-[80%]">
            {video.title}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-brand-bg rounded text-brand-secondary hover:text-brand-text transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Player */}
        <div className="aspect-video w-full bg-black rounded-md overflow-hidden border border-brand-border shrink-0">
          <video
            src={video.videoFile}
            controls
            autoPlay
            poster={video.thumbnail}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Action Controls & Views info */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-b border-brand-border pb-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-secondary">
            <span className="flex items-center gap-1"><Eye size={13} />{video.views} views</span>
            <span className="flex items-center gap-1"><Calendar size={13} />Published {joinedDate}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-brand-bg border border-brand-border px-3 py-1.5 rounded-full self-start sm:self-auto">
            <button 
              onClick={handleToggleLike} 
              className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 hover:text-brand-accent transition-colors cursor-pointer ${isLiked ? 'text-brand-accent' : 'text-brand-secondary'}`}
              title="Like video"
            >
              <ThumbsUp size={14} fill={isLiked ? "currentColor" : "none"} />
              <span>{likesCount}</span>
            </button>

            <span className="w-[1px] h-3 bg-brand-border"></span>

            <button 
              onClick={handleToggleDislike} 
              className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 hover:text-brand-accent transition-colors cursor-pointer ${isDisliked ? 'text-brand-accent' : 'text-brand-secondary'}`}
              title="Dislike video"
            >
              <ThumbsDown size={14} fill={isDisliked ? "currentColor" : "none"} />
              <span>{dislikesCount}</span>
            </button>
          </div>
        </div>

        {/* Description Panel */}
        <div className="bg-brand-bg border border-brand-border p-4 rounded-md">
          {/* Owner details */}
          <div className="flex items-center gap-3 border-b border-brand-border pb-3 mb-3">
            <img
              src={video.owner?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"}
              alt=""
              className="w-9 h-9 rounded-full object-cover border border-brand-border shrink-0"
            />
            <div className="flex-grow min-w-0">
              <h4 className="font-bold text-xs text-brand-text truncate leading-tight">{video.owner?.fullName || 'Anonymous'}</h4>
              <p className="text-[10px] text-brand-secondary truncate">@{video.owner?.username || 'unknown'}</p>
              <span className="text-[9px] text-brand-secondary font-medium">
                {statsLoading ? 'Loading subscribers...' : `${subscribersCount} subscribers`}
              </span>
            </div>
            {currentUser && video.owner && (video.owner._id ? video.owner._id !== currentUser._id : video.owner !== currentUser._id) ? (
              <button
                onClick={handleToggleSubscribe}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                  isSubscribed 
                    ? 'bg-brand-bg text-brand-secondary border-brand-border hover:bg-brand-border' 
                    : 'bg-brand-accent text-white border-brand-accent hover:bg-brand-hover'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            ) : (
              <span className="text-[9px] text-brand-secondary bg-brand-border px-2.5 py-1 rounded font-semibold">Your Channel</span>
            )}
          </div>
          <p className="text-xs text-brand-text leading-relaxed whitespace-pre-line">
            {video.description}
          </p>
        </div>

        {/* Comments section */}
        <div className="flex flex-col gap-4">
          <h3 className="font-extrabold text-xs tracking-wider text-brand-secondary uppercase flex items-center gap-2">
            <MessageSquare size={13} />
            <span>Comments ({comments.length})</span>
          </h3>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a public comment on VideoTube..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              disabled={commentSubmitting}
              className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors flex-1"
            />
            <button 
              type="submit" 
              disabled={commentSubmitting || !newCommentText.trim()} 
              className="px-3.5 bg-brand-accent hover:bg-brand-hover disabled:bg-brand-border text-white text-xs font-bold rounded-md transition-colors cursor-pointer flex items-center justify-center"
            >
              <Send size={12} />
            </button>
          </form>

          {/* Comments List */}
          {commentsLoading ? (
            <div className="flex justify-center p-6">
              <div className="w-5 h-5 border-2 border-brand-border border-t-brand-accent rounded-full animate-spin"></div>
            </div>
          ) : commentsError ? (
            <div className="p-3 bg-red-50 border border-red-200 text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2"><AlertCircle size={14} />{commentsError}</div>
          ) : comments.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-2">
              {comments.map(comment => {
                const commentDate = comment.createdAt 
                  ? new Date(comment.createdAt).toLocaleDateString()
                  : 'just now';

                const isCommentOwner = comment.owner?._id 
                  ? comment.owner._id === currentUser?._id
                  : comment.owner === currentUser?._id;

                return (
                  <div key={comment._id} className="flex gap-3 p-3.5 bg-brand-card border border-brand-border rounded-md relative items-start hover:border-brand-secondary/40 transition-colors">
                    <img
                      src={comment.owner?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80"}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover border border-brand-border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-brand-text truncate">@{comment.owner?.username || 'unknown'}</span>
                        <span className="text-[9px] text-brand-secondary">{commentDate}</span>
                      </div>
                      <p className="text-xs text-brand-secondary leading-relaxed break-words">{comment.content}</p>
                    </div>

                    {isCommentOwner && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="p-1 hover:bg-red-50 text-brand-accent hover:text-brand-hover rounded transition-colors self-center cursor-pointer"
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
            <p className="text-xs text-brand-secondary italic text-center py-6">No comments published yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
