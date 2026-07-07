import React, { useState, useRef } from 'react';
import { X, Film, Image as ImageIcon, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { apiRequest } from '../utils/api';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  if (!isOpen) return null;

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) setVideoFile(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) setThumbnail(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }
    if (!videoFile) {
      setError('Please select a video file (MP4/WebM)');
      return;
    }
    if (!thumbnail) {
      setError('Please select a thumbnail image');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('videoFile', videoFile);
      formData.append('thumbnail', thumbnail);

      await apiRequest('/videos', {
        method: 'POST',
        body: formData
      });

      setSuccess('Video uploaded successfully!');
      setTimeout(() => {
        onUploadSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to upload video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="auth-card">
        <div style={styles.header}>
          <h2 style={{ margin: 0, fontSize: '20px', fontFamily: 'var(--font-heading)' }}>Upload New Video</h2>
          <button onClick={onClose} style={styles.closeBtn} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginTop: '16px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginTop: '16px' }}>
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="Give your stream an engaging title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-input"
              placeholder="What is this video about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
              style={{ resize: 'none', height: '80px' }}
            />
          </div>

          <div className="file-upload-grid" style={{ marginBottom: '24px' }}>
            {/* Video File Uploader */}
            <div className="file-uploader" onClick={() => !loading && videoInputRef.current?.click()} style={{ minHeight: '120px' }}>
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={handleVideoChange}
                disabled={loading}
                className="hidden-file-input"
              />
              <Film className="file-uploader-icon" size={24} style={{ color: videoFile ? 'var(--primary)' : 'inherit' }} />
              <span className="file-uploader-text" style={{ marginTop: '6px' }}>
                {videoFile ? videoFile.name.substring(0, 15) + '...' : 'Select Video *'}
              </span>
            </div>

            {/* Thumbnail Uploader */}
            <div className="file-uploader" onClick={() => !loading && thumbnailInputRef.current?.click()} style={{ minHeight: '120px' }}>
              <input
                type="file"
                ref={thumbnailInputRef}
                accept="image/*"
                onChange={handleThumbnailChange}
                disabled={loading}
                className="hidden-file-input"
              />
              <ImageIcon className="file-uploader-icon" size={24} style={{ color: thumbnail ? 'var(--primary)' : 'inherit' }} />
              <span className="file-uploader-text" style={{ marginTop: '6px' }}>
                {thumbnail ? thumbnail.name.substring(0, 15) + '...' : 'Select Thumbnail *'}
              </span>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Uploading & Processing...' : 'Publish Video'}
          </button>
        </form>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '24px'
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
    padding: '30px',
    borderRadius: '16px',
    position: 'relative'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '12px'
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
  }
};

export default UploadModal;
