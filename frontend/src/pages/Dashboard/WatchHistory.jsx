import React, { useState, useEffect } from 'react';
import { Home, User as UserIcon, History, LogOut, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';

const WatchHistory = ({ user, handleLogout }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiRequest('/users/history', { method: 'GET' });
        if (response && response.data) {
          setHistory(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch watch history:", err.message);
        setError("Could not load watch history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

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
            <li className="nav-link-item">
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
            <li className="nav-link-item active">
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

      {/* Main Content */}
      <main className="app-main">
        <header className="header-bar">
          <div className="page-title">
            <h1>Watch History</h1>
            <p>Review the videos you have watched recently</p>
          </div>
        </header>

        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : history.length > 0 ? (
          <div className="video-grid">
            {history.map((video, index) => (
              <article className="video-card" key={video._id || index}>
                <div className="video-thumbnail-container">
                  <img src={video.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"} alt={video.title} className="video-thumbnail" />
                  {video.duration && <span className="video-duration">{video.duration}s</span>}
                </div>
                <div className="video-content">
                  <div className="video-author-row">
                    <div className="video-meta-info">
                      <h4 style={{ margin: 0 }}>{video.title}</h4>
                      <p style={{ marginTop: '4px' }}>{video.description}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Video size={48} />
            <h3>No watch history found</h3>
            <p>Start watching videos to populate your history timeline.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WatchHistory;
