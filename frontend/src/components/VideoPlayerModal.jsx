import React from 'react';
import { X, Eye, Calendar, User } from 'lucide-react';

const VideoPlayerModal = ({ video, isOpen, onClose }) => {
  if (!isOpen || !video) return null;

  const joinedDate = video.createdAt
    ? new Date(video.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="auth-card">
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

        {/* Video Metadata & Owner info */}
        <div style={styles.detailsContainer}>
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

          <div style={styles.descriptionBox}>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{video.description}</p>
          </div>

          {/* Owner details */}
          <div style={styles.ownerRow}>
            <img
              src={video.owner?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"}
              alt="Owner Avatar"
              style={styles.ownerAvatar}
            />
            <div style={styles.ownerInfo}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{video.owner?.fullName || 'Anonymous'}</h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>@{video.owner?.username || 'unknown'}</p>
            </div>
          </div>
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
    maxWidth: '800px', // Wider modal for player
    padding: '24px',
    borderRadius: '16px',
    position: 'relative',
    maxHeight: '90vh',
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
  detailsContainer: {
    marginTop: '20px',
    textAlign: 'left'
  },
  metaRow: {
    display: 'flex',
    gap: '24px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '12px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  descriptionBox: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-glass)',
    padding: '16px',
    borderRadius: '10px',
    marginBottom: '20px',
    maxHeight: '120px',
    overflowY: 'auto'
  },
  ownerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderTop: '1px solid var(--border-glass)',
    paddingTop: '16px'
  },
  ownerAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid var(--primary)'
  },
  ownerInfo: {
    display: 'flex',
    flexDirection: 'column'
  }
};

export default VideoPlayerModal;
