import React, { useState } from 'react';
import { Home, User as UserIcon, History, LogOut, Search, Play, Heart, Users, Video } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MOCK_VIDEOS = [
  {
    id: 1,
    title: "Building a Glassmorphic React UI from Scratch",
    author: "CodeVibe",
    views: "124K views",
    time: "2 days ago",
    duration: "18:42",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 2,
    title: "Advanced NodeJS & Express Backend Architecture",
    author: "Chai & Code",
    views: "340K views",
    time: "1 week ago",
    duration: "45:10",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2079?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 3,
    title: "How to deploy Docker Containers to AWS ECS",
    author: "DevOps Zone",
    views: "89K views",
    time: "3 days ago",
    duration: "12:15",
    thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 4,
    title: "The Future of Web Development in 2026",
    author: "Tech Vision",
    views: "1.2M views",
    time: "3 weeks ago",
    duration: "22:05",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 5,
    title: "Complete MongoDB Aggregation Pipeline Tutorial",
    author: "Query Master",
    views: "45K views",
    time: "5 days ago",
    duration: "30:40",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 6,
    title: "Designing Fluid UI Animations with CSS Variables",
    author: "Motion Labs",
    views: "210K views",
    time: "1 month ago",
    duration: "14:55",
    thumbnail: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80"
  }
];

const Dashboard = ({ user, handleLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredVideos = MOCK_VIDEOS.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

          <div className="search-bar">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search videos or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Video Grid */}
        <section>
          <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>Trending Videos</h2>
          {filteredVideos.length > 0 ? (
            <div className="video-grid">
              {filteredVideos.map(video => (
                <article className="video-card" key={video.id}>
                  <div className="video-thumbnail-container">
                    <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                    <span className="video-duration">{video.duration}</span>
                  </div>
                  <div className="video-content">
                    <div className="video-author-row">
                      <img src={video.avatar} alt={video.author} className="video-author-avatar" />
                      <div className="video-meta-info">
                        <h4>{video.title}</h4>
                        <p>{video.author}</p>
                        <div className="video-stats">
                          <span>{video.views}</span> • <span>{video.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Video size={48} />
              <h3>No videos found</h3>
              <p>Try refining your search terms.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
