import React, { useState, useEffect } from 'react';
import { Home, User as UserIcon, History, LogOut, Search, Play, PlusCircle, Trash2, Video, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import UploadModal from '../../components/UploadModal';
import VideoPlayerModal from '../../components/VideoPlayerModal';

const Dashboard = ({ user, handleLogout }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchVideos = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const endpoint = query ? `/videos?query=${encodeURIComponent(query)}` : '/videos';
      const response = await apiRequest(endpoint, { method: 'GET' });
      if (response && response.data) {
        setVideos(response.data);
      }
    } catch (err) {
      console.error('Failed to load videos:', err.message);
      setError('Could not load streams from server.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos on mount and search query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchVideos(searchQuery);
    }, 400); // Debounce searches to reduce network spam

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleVideoClick = async (video) => {
    try {
      // Trigger GET /videos/:videoId to register watch/increment views
      const response = await apiRequest(`/videos/${video._id}`, { method: 'GET' });
      if (response && response.data) {
        // Open player with latest details
        setSelectedVideo(response.data);
        // Refresh video list to update view count in background
        fetchVideos(searchQuery);
      }
    } catch (err) {
      console.error('Failed to register watch:', err.message);
      // Fallback: open with existing details
      setSelectedVideo(video);
    }
  };

  const handleDeleteVideo = async (e, videoId) => {
    e.stopPropagation(); // Avoid triggering video click
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await apiRequest(`/videos/${videoId}`, { method: 'DELETE' });
      // Reload list
      fetchVideos(searchQuery);
    } catch (err) {
      alert(err.message || 'Failed to delete video.');
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div className="logo-container">
          <div className="logo-icon">V</div>
          <div className="logo-text">VibeStream</div>
        </div>

        <nav>
          <ul className="nav-links">
            <li className="nav-link-item active">
              <Link to="/">
                <Home size={18} />
                <span>Home</span>
              </Link>
            </li>
            <li className="nav-link-item">
              <Link to="/profile">
                <UserIcon size={18} />
                <span>Profile Settings</span>
              </Link>
            </li>
            <li className="nav-link-item">
              <Link to="/history">
                <History size={18} />
                <span>Watch History</span>
              </Link>
            </li>
          </ul>
        </nav>

        {user && (
          <div className="sidebar-user">
            <img 
              src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} 
              alt="Avatar" 
              className="user-avatar-small" 
            />
            <div className="user-info-small">
              <h4>{user.fullName}</h4>
              <p>@{user.username}</p>
            </div>
            <button className="logout-btn-icon" onClick={handleLogout} title="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* Main Panel Content */}
      <main className="app-main">
        <header className="header-bar">
          <div className="page-title">
            <h1>Welcome back, {user ? user.fullName.split(' ')[0] : 'Viber'}!</h1>
            <p>Explore recommended tech videos & channels</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="search-bar">
              <Search className="search-icon" size={16} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button 
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', width: 'auto' }}
              onClick={() => setIsUploadOpen(true)}
            >
              <PlusCircle size={18} />
              <span>Upload Video</span>
            </button>
          </div>
        </header>

        {/* Video Grid */}
        <section>
          <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>Trending Videos</h2>
          {error && <div className="alert alert-danger"><AlertCircle size={16} />{error}</div>}
          
          {loading ? (
            <div className="loader-container">
              <div className="spinner"></div>
            </div>
          ) : videos.length > 0 ? (
            <div className="video-grid">
              {videos.map(video => {
                // Check ownership: owner can be populated (object) or unpopulated (string ID)
                const isOwner = video.owner?._id 
                  ? video.owner._id.toString() === user?._id.toString()
                  : video.owner?.toString() === user?._id?.toString();

                const minutes = Math.floor((video.duration || 0) / 60);
                const seconds = Math.floor((video.duration || 0) % 60);
                const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                return (
                  <article 
                    className="video-card" 
                    key={video._id} 
                    onClick={() => handleVideoClick(video)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <div className="video-thumbnail-container">
                      <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                      <span className="video-duration">{formattedDuration}</span>
                      
                      {isOwner && (
                        <button 
                          onClick={(e) => handleDeleteVideo(e, video._id)}
                          style={styles.deleteButton}
                          title="Delete Video"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="video-content">
                      <div className="video-author-row">
                        <img 
                          src={video.owner?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} 
                          alt="Channel Avatar" 
                          className="video-author-avatar" 
                        />
                        <div className="video-meta-info" style={{ flexGrow: 1 }}>
                          <h4 title={video.title}>{video.title}</h4>
                          <p>@{video.owner?.username || 'unknown'}</p>
                          <div className="video-stats">
                            <span>{video.views} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Video size={48} />
              <h3>No videos uploaded yet</h3>
              <p>Be the first to publish a new stream!</p>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={() => fetchVideos(searchQuery)}
      />

      <VideoPlayerModal 
        video={selectedVideo} 
        isOpen={!!selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
      />
    </div>
  );
};

const styles = {
  deleteButton: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    border: 'none',
    color: '#fff',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
    transition: 'var(--transition-smooth)'
  }
};

export default Dashboard;
