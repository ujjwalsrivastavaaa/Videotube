import React, { useState, useEffect } from 'react';
import { 
  Home, 
  User as UserIcon, 
  History, 
  LogOut, 
  Search, 
  PlusCircle, 
  Trash2, 
  Video, 
  AlertCircle,
  Menu,
  Bell,
  Heart,
  Bookmark,
  Gamepad,
  Music as MusicIcon,
  Tv,
  GraduationCap,
  Radio,
  Mic,
  MoreVertical,
  ChevronRight,
  Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import UploadModal from '../../components/UploadModal';
import VideoPlayerModal from '../../components/VideoPlayerModal';

const Dashboard = ({ user, handleLogout }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const categories = [
    { name: 'All', icon: null },
    { name: 'Trending', icon: Flame },
    { name: 'Music', icon: MusicIcon },
    { name: 'Gaming', icon: Gamepad },
    { name: 'Education', icon: GraduationCap },
    { name: 'Podcasts', icon: Mic },
    { name: 'Live', icon: Radio }
  ];

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
      setError('Could not load videos from VideoTube servers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchVideos(searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleVideoClick = async (video) => {
    try {
      const response = await apiRequest(`/videos/${video._id}`, { method: 'GET' });
      if (response && response.data) {
        setSelectedVideo(response.data);
        fetchVideos(searchQuery);
      }
    } catch (err) {
      console.error('Failed to register watch:', err.message);
      setSelectedVideo(video);
    }
  };

  const handleDeleteVideo = async (e, videoId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await apiRequest(`/videos/${videoId}`, { method: 'DELETE' });
      fetchVideos(searchQuery);
    } catch (err) {
      alert(err.message || 'Failed to delete video.');
    }
  };

  // Dynamic content segmentation for Visual Richness on default view
  const getFilteredVideos = () => {
    if (selectedCategory === 'All') return videos;
    
    if (selectedCategory === 'Trending') {
      return [...videos]
        .filter(v => (v.views || 0) > 0)
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 50);
    }
    
    return videos.filter(video => {
      if (video.category === selectedCategory) return true;
      
      const title = video.title.toLowerCase();
      const desc = video.description.toLowerCase();
      
      switch(selectedCategory) {
        case 'Music':
          return title.includes('music') || desc.includes('song') || desc.includes('music') || title.includes('lofi');
        case 'Gaming':
          return title.includes('game') || desc.includes('gaming') || title.includes('play') || desc.includes('xbox');
        case 'Education':
          return title.includes('learn') || desc.includes('tutorial') || title.includes('course') || desc.includes('code');
        case 'Podcasts':
          return title.includes('podcast') || desc.includes('talk') || desc.includes('interview');
        case 'Live':
          return title.includes('live') || desc.includes('stream') || title.includes('pulsating');
        default:
          return false;
      }
    });
  };

  // Video duration formatter
  const formatDuration = (sec) => {
    const minutes = Math.floor((sec || 0) / 60);
    const seconds = Math.floor((sec || 0) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const filteredVideos = getFilteredVideos();

  // Distinct section filters for homepage grid presentation when category is "All" and no active search
  const trendingSection = [...videos]
    .filter(v => (v.views || 0) > 0)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 50);

  const liveSection = videos
    .filter(v => v.category === 'Live' || v.title.toLowerCase().includes('live') || v.description.toLowerCase().includes('live'))
    .slice(0, 4);

  const gamingSection = videos
    .filter(v => v.category === 'Gaming' || v.category === 'Education' || v.title.toLowerCase().includes('game') || v.title.toLowerCase().includes('code') || v.title.toLowerCase().includes('learn'))
    .slice(0, 4);

  const generalSection = videos;

  return (
    <div className="min-height-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-accent selection:text-white">
      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-brand-card border-b border-brand-border h-14">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-brand-bg rounded-md text-brand-secondary hover:text-brand-text transition-colors"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu size={20} />
          </button>
          
          <Link to="/" className="flex items-center gap-2 group select-none">
            <div className="bg-brand-accent group-hover:bg-brand-hover text-white w-7 h-7 rounded-sm flex items-center justify-center font-black text-sm tracking-tighter transition-colors">
              VT
            </div>
            <span className="font-extrabold text-lg tracking-tight text-brand-text">
              VideoTube
            </span>
          </Link>
        </div>

        {/* Central Search Bar */}
        <div className="relative w-full max-w-lg hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-secondary" size={15} />
          <input 
            type="text" 
            placeholder="Search creators, titles, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border hover:border-brand-secondary focus:border-brand-text focus:outline-none rounded-md py-1.5 pl-10 pr-4 text-xs transition-colors"
          />
        </div>

        {/* Action Controls & Session */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-accent hover:bg-brand-hover text-white text-xs font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle size={14} />
            <span className="hidden md:inline">Upload</span>
          </button>

          <button className="p-1.5 text-brand-secondary hover:text-brand-text hover:bg-brand-bg rounded-md transition-all relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-accent rounded-full"></span>
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-brand-border">
              <img 
                src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80"} 
                alt={user.fullName} 
                className="w-7 h-7 rounded-full object-cover border border-brand-border"
              />
              <span className="text-xs font-semibold text-brand-text hidden lg:block">{user.fullName.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Framework Layout Container */}
      <div className="flex flex-1 min-h-[calc(100vh-3.5rem)] relative">
        {/* Collapsible Left Sidebar */}
        <aside 
          className={`bg-brand-card border-r border-brand-border flex flex-col justify-between py-6 transition-all duration-300 z-40 shrink-0 ${
            sidebarCollapsed ? 'w-0 overflow-hidden px-0 opacity-0' : 'w-60 px-4 opacity-100'
          } fixed md:sticky top-14 h-[calc(100vh-3.5rem)]`}
        >
          <div className="flex flex-col gap-6">
            <nav className="flex flex-col gap-1">
              <Link 
                to="/" 
                className="flex items-center gap-3 px-3 py-2 bg-brand-bg text-brand-accent font-semibold text-xs rounded-md transition-colors"
              >
                <Home size={15} />
                <span>Home Feed</span>
              </Link>
              
              <Link 
                to="/profile" 
                className="flex items-center gap-3 px-3 py-2 text-brand-secondary hover:text-brand-text hover:bg-brand-bg font-medium text-xs rounded-md transition-colors"
              >
                <UserIcon size={15} />
                <span>Creator Studio</span>
              </Link>
              
              <Link 
                to="/history" 
                className="flex items-center gap-3 px-3 py-2 text-brand-secondary hover:text-brand-text hover:bg-brand-bg font-medium text-xs rounded-md transition-colors"
              >
                <History size={15} />
                <span>Watch History</span>
              </Link>
            </nav>

            {/* Subscriptions Block */}
            <div className="border-t border-brand-border pt-4">
              <h3 className="px-3 text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-2">My Channel</h3>
              {user ? (
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <img src={user.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                  <span className="text-xs text-brand-text truncate">@{user.username}</span>
                </div>
              ) : (
                <p className="px-3 text-xs text-brand-secondary italic">Not Signed In</p>
              )}
            </div>
          </div>

          {/* Logout Section */}
          {user && (
            <div className="border-t border-brand-border pt-4 px-2">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-brand-secondary hover:text-brand-accent hover:bg-brand-danger-bg rounded-md border border-transparent hover:border-brand-danger-border transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out Session</span>
              </button>
            </div>
          )}
        </aside>

        {/* Content Framework Area */}
        <main className={`flex-1 flex flex-col p-6 max-w-full overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'md:pl-6' : 'md:pl-6'
        }`}>
          {/* Scrollable Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-brand-border/60">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer ${
                    isSelected 
                      ? 'bg-brand-accent text-white border-brand-accent' 
                      : 'bg-brand-card hover:bg-brand-bg text-brand-secondary hover:text-brand-text border-brand-border'
                  }`}
                >
                  {Icon && <Icon size={12} />}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-brand-danger-bg border border-brand-danger-border rounded-md text-brand-accent text-xs font-semibold">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3 animate-pulse">
                  <div className="aspect-video bg-brand-border rounded-md"></div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-border shrink-0"></div>
                    <div className="flex flex-col gap-2 w-full">
                      <div className="h-4 bg-brand-border rounded w-4/5"></div>
                      <div className="h-3 bg-brand-border rounded w-3/5"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVideos.length > 0 ? (
            // Conditional presentation to avoid SaaS repetition
            selectedCategory === 'All' && !searchQuery ? (
              <div className="flex flex-col gap-10">
                {/* 1. Asymmetrical Trending Section */}
                {trendingSection.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Flame className="text-brand-accent" size={18} />
                      <h2 className="font-extrabold text-base tracking-tight text-brand-text">Trending Content</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {trendingSection.map((video, idx) => {
                        const isOwner = video.owner?._id ? video.owner._id === user?._id : video.owner === user?._id;
                        return (
                          <article 
                            key={video._id} 
                            onClick={() => handleVideoClick(video)}
                            className="bg-brand-card border border-brand-border rounded-md overflow-hidden group hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
                          >
                            <div className="aspect-video relative overflow-hidden bg-brand-bg">
                              <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300" />
                              <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                                {formatDuration(video.duration)}
                              </span>
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div className="flex gap-3">
                                <img src={video.owner?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} className="w-8 h-8 rounded-full object-cover shrink-0 border border-brand-border" alt="" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-xs text-brand-text line-clamp-2 leading-tight group-hover:text-brand-accent transition-colors">{video.title}</h4>
                                  <p className="text-[11px] text-brand-secondary mt-1 truncate">@{video.owner?.username || 'unknown'}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between border-t border-brand-border/60 pt-2 text-[10px] text-brand-secondary font-medium">
                                <span>{video.views || 0} views</span>
                                {isOwner && (
                                  <button 
                                    onClick={(e) => handleDeleteVideo(e, video._id)}
                                    className="p-1 hover:bg-brand-danger-bg text-brand-accent hover:text-brand-hover rounded transition-colors"
                                    title="Delete video"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* 2. Pulsating Live Rail */}
                {liveSection.length > 0 && (
                  <section className="bg-brand-card border border-brand-border rounded-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-accent animate-ping"></span>
                        <h2 className="font-extrabold text-base tracking-tight text-brand-text">Active Live Broadcasts</h2>
                      </div>
                      <Link to="/" className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-0.5">
                        <span>See All Live</span>
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {liveSection.map(video => (
                        <div 
                          key={video._id}
                          onClick={() => handleVideoClick(video)}
                          className="aspect-video relative rounded-md overflow-hidden bg-brand-bg group cursor-pointer border border-brand-border"
                        >
                          <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" alt="" />
                          <span className="absolute top-2 left-2 bg-brand-accent text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm tracking-wide flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                            LIVE
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                            <h4 className="text-white text-xs font-bold truncate">{video.title}</h4>
                            <p className="text-white/70 text-[10px] truncate">@{video.owner?.username || 'user'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. Horizontal Scrollable Music Segment */}
                {gamingSection.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Gamepad className="text-brand-accent" size={16} />
                      <h2 className="font-extrabold text-base tracking-tight text-brand-text">Gaming & Tutorials</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {gamingSection.map(video => (
                        <div 
                          key={video._id}
                          onClick={() => handleVideoClick(video)}
                          className="bg-brand-card border border-brand-border rounded-md p-3 hover:border-brand-secondary transition-all cursor-pointer flex gap-3"
                        >
                          <div className="w-24 aspect-video shrink-0 bg-brand-bg rounded overflow-hidden relative">
                            <img src={video.thumbnail} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-[11px] text-brand-text line-clamp-2 leading-tight">{video.title}</h4>
                              <p className="text-[10px] text-brand-secondary mt-0.5 truncate">@{video.owner?.username}</p>
                            </div>
                            <span className="text-[9px] text-brand-secondary">{video.views} views</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. General Recommended grid */}
                <section>
                  <h2 className="font-extrabold text-base tracking-tight text-brand-text mb-4">Recommended For You</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {generalSection.map(video => {
                      const isOwner = video.owner?._id ? video.owner._id === user?._id : video.owner === user?._id;
                      return (
                        <article 
                          key={video._id} 
                          onClick={() => handleVideoClick(video)}
                          className="bg-brand-card border border-brand-border rounded-md overflow-hidden group hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-full"
                        >
                          <div className="aspect-video relative overflow-hidden bg-brand-bg">
                            <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300" />
                            <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                              {formatDuration(video.duration)}
                            </span>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div className="flex gap-3">
                              <img src={video.owner?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} className="w-8 h-8 rounded-full object-cover shrink-0 border border-brand-border" alt="" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-brand-text line-clamp-2 leading-tight group-hover:text-brand-accent transition-colors">{video.title}</h4>
                                <p className="text-[11px] text-brand-secondary mt-1 truncate">@{video.owner?.username || 'unknown'}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-brand-border/60 pt-2 text-[10px] text-brand-secondary font-medium">
                              <span>{video.views || 0} views</span>
                              {isOwner && (
                                  <button 
                                    onClick={(e) => handleDeleteVideo(e, video._id)}
                                    className="p-1 hover:bg-brand-danger-bg text-brand-accent hover:text-brand-hover rounded transition-colors"
                                    title="Delete video"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </div>
            ) : (
              // Simple category grid representation
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredVideos.map(video => {
                  const isOwner = video.owner?._id ? video.owner._id === user?._id : video.owner === user?._id;
                  return (
                    <article 
                      key={video._id} 
                      onClick={() => handleVideoClick(video)}
                      className="bg-brand-card border border-brand-border rounded-md overflow-hidden group hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-full"
                    >
                      <div className="aspect-video relative overflow-hidden bg-brand-bg">
                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300" />
                        <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                          {formatDuration(video.duration)}
                        </span>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div className="flex gap-3">
                          <img src={video.owner?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} className="w-8 h-8 rounded-full object-cover shrink-0 border border-brand-border" alt="" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-brand-text line-clamp-2 leading-tight group-hover:text-brand-accent transition-colors">{video.title}</h4>
                            <p className="text-[11px] text-brand-secondary mt-1 truncate">@{video.owner?.username || 'unknown'}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-brand-border/60 pt-2 text-[10px] text-brand-secondary font-medium">
                          <span>{video.views || 0} views</span>
                          {isOwner && (
                            <button 
                              onClick={(e) => handleDeleteVideo(e, video._id)}
                              className="p-1 hover:bg-brand-danger-bg text-brand-accent hover:text-brand-hover rounded transition-colors"
                              title="Delete video"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-brand-card border border-brand-border rounded-md px-6">
              <Video className="text-brand-secondary mb-3" size={40} />
              <h3 className="font-bold text-sm text-brand-text">No Streams Available</h3>
              <p className="text-xs text-brand-secondary mt-1 max-w-sm">
                No videos match the selection. Upload a new MP4/WebM video to populate the VideoTube feed!
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modals Container */}
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={() => fetchVideos(searchQuery)}
      />

      <VideoPlayerModal 
        video={selectedVideo} 
        isOpen={!!selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
        currentUser={user}
      />
    </div>
  );
};

export default Dashboard;
