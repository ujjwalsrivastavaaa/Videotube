import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  User as UserIcon, 
  History, 
  LogOut, 
  Camera, 
  Image as ImageIcon, 
  Users, 
  UserCheck, 
  Mail, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  Menu,
  PlusCircle,
  Bell,
  Settings,
  Shield,
  Video,
  BarChart3,
  BookOpen,
  MessageSquare,
  Eye,
  ArrowUpRight,
  Palette,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { apiRequest } from '../../utils/api';
import UploadModal from '../../components/UploadModal';

const Profile = ({ user, setUser, handleLogout }) => {
  const { theme, setTheme } = useTheme();

  // Stats state
  const [channelStats, setChannelStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Forms state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState('videos'); // videos, playlists, community, about, analytics, settings
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [userVideos, setUserVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);

  const [detailsError, setDetailsError] = useState('');
  const [detailsSuccess, setDetailsSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [coverError, setCoverError] = useState('');
  const [coverSuccess, setCoverSuccess] = useState('');

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Fetch channel stats
  useEffect(() => {
    const fetchChannelStats = async () => {
      if (!user?.username) return;
      try {
        const data = await apiRequest(`/users/c/${user.username}`, { method: 'GET' });
        if (data && data.data) {
          setChannelStats(data.data);
        }
      } catch (err) {
        console.error("Failed to load channel stats:", err.message);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchChannelStats();
  }, [user]);

  // Fetch user's uploaded videos
  const fetchUserVideos = async () => {
    if (!user?._id) return;
    try {
      setVideosLoading(true);
      const data = await apiRequest(`/videos?userId=${user._id}`, { method: 'GET' });
      if (data && data.data) {
        setUserVideos(data.data);
      }
    } catch (err) {
      console.error("Failed to load user's videos:", err.message);
    } finally {
      setVideosLoading(false);
    }
  };

  useEffect(() => {
    fetchUserVideos();
  }, [user]);

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await apiRequest(`/videos/${videoId}`, { method: 'DELETE' });
      fetchUserVideos();
    } catch (err) {
      alert(err.message || "Failed to delete video");
    }
  };

  // Update Account Details
  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setDetailsError('');
    setDetailsSuccess('');

    if (!fullName || !email) {
      setDetailsError('All details fields are required');
      return;
    }

    setDetailsLoading(true);
    try {
      const response = await apiRequest('/users/update-account', {
        method: 'PATCH',
        body: JSON.stringify({ fullName, email })
      });
      if (response && response.data) {
        setUser(response.data);
        setDetailsSuccess('Account details updated successfully!');
      }
    } catch (err) {
      setDetailsError(err.message || 'Failed to update account details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword || !newPassword) {
      setPasswordError('Please fill in both password fields');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiRequest('/users/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      setPasswordSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Make sure old password is correct.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Update Avatar File
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarError('');
    setAvatarSuccess('');
    setAvatarLoading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiRequest('/users/avatar', {
        method: 'PATCH',
        body: formData
      });

      if (response && response.data) {
        setUser(response.data);
        setAvatarSuccess('Avatar updated successfully!');
      }
    } catch (err) {
      setAvatarError(err.message || 'Failed to upload avatar.');
    } finally {
      setAvatarLoading(false);
    }
  };

  // Update Cover Image File
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCoverError('');
    setCoverSuccess('');
    setCoverLoading(true);

    try {
      const formData = new FormData();
      formData.append('coverImage', file);

      const response = await apiRequest('/users/cover-image', {
        method: 'PATCH',
        body: formData
      });

      if (response && response.data) {
        setUser(response.data);
        setCoverSuccess('Cover image updated successfully!');
      }
    } catch (err) {
      setCoverError(err.message || 'Failed to upload cover image.');
    } finally {
      setCoverLoading(false);
    }
  };

  const joinedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : 'Unknown';

  const tabs = [
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'playlists', label: 'Playlists', icon: BookOpen },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'about', label: 'About', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-height-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-accent selection:text-white">
      {/* Hidden inputs for uploads */}
      <input 
        type="file" 
        ref={avatarInputRef} 
        accept="image/*" 
        style={{ display: 'none' }} 
        onChange={handleAvatarUpload}
      />
      <input 
        type="file" 
        ref={coverInputRef} 
        accept="image/*" 
        style={{ display: 'none' }} 
        onChange={handleCoverUpload}
      />

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
                src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} 
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
                className="flex items-center gap-3 px-3 py-2 text-brand-secondary hover:text-brand-text hover:bg-brand-bg font-medium text-xs rounded-md transition-colors"
              >
                <Home size={15} />
                <span>Home Feed</span>
              </Link>
              
              <Link 
                to="/profile" 
                className="flex items-center gap-3 px-3 py-2 bg-brand-bg text-brand-accent font-semibold text-xs rounded-md transition-colors"
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-brand-secondary hover:text-brand-accent hover:bg-red-50 rounded-md border border-transparent hover:border-red-100 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out Session</span>
              </button>
            </div>
          )}
        </aside>

        {/* Content Framework Area */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          {/* Creator Profile Header Wrapper (relative, no overflow-hidden) */}
          <div className="relative mb-6">
            {/* Creator Profile Banner (overflow-hidden) */}
            <div 
              className="h-44 md:h-52 w-full rounded-md border border-brand-border bg-cover bg-center overflow-hidden relative shadow-sm"
              style={{ backgroundImage: `url(${user?.coverImage || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80"})` }}
            >
              <button 
                onClick={() => coverInputRef.current?.click()}
                disabled={coverLoading}
                className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold rounded-sm border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
              >
                <ImageIcon size={12} />
                <span>{coverLoading ? 'Uploading...' : 'Edit Banner'}</span>
              </button>
            </div>

            {/* Avatar & Channel Details (overlapping banner bottom) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 px-6 md:px-8 -mt-10 sm:-mt-14 relative z-10">
              <div className="relative group shrink-0">
                <img 
                  src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"} 
                  alt={user?.fullName} 
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-brand-card bg-brand-card shadow-md"
                />
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute bottom-1 right-1 bg-brand-accent hover:bg-brand-hover text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-brand-card shadow transition-all cursor-pointer"
                  title="Change avatar file"
                >
                  <Camera size={14} />
                </button>
              </div>
              
              <div className="mb-2 text-left">
                <h2 className="font-extrabold text-lg md:text-xl text-brand-text leading-tight mb-1">{user?.fullName}</h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-secondary">
                  <span className="font-semibold text-brand-text">@{user?.username}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{statsLoading ? '...' : (channelStats?.subscribersCount || 0)} subscribers</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Joined {joinedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upload errors & successes */}
          {avatarError && <div className="mb-4 p-3 bg-brand-danger-bg border border-brand-danger-border text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2"><AlertCircle size={14} />{avatarError}</div>}
          {avatarSuccess && <div className="mb-4 p-3 bg-brand-success-bg border border-brand-success-border text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2"><CheckCircle size={14} />{avatarSuccess}</div>}
          {coverError && <div className="mb-4 p-3 bg-brand-danger-bg border border-brand-danger-border text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2"><AlertCircle size={14} />{coverError}</div>}
          {coverSuccess && <div className="mb-4 p-3 bg-brand-success-bg border border-brand-success-border text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2"><CheckCircle size={14} />{coverSuccess}</div>}

          {/* Premium Layout Tabs bar */}
          <div className="flex border-b border-brand-border overflow-x-auto scrollbar-none mb-8">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs shrink-0 transition-all cursor-pointer ${
                    isActive 
                      ? 'border-brand-accent text-brand-accent' 
                      : 'border-transparent text-brand-secondary hover:text-brand-text'
                  }`}
                >
                  <TabIcon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Panel contents */}
          <div className="min-h-[250px]">
            {activeTab === 'videos' && (
              videosLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-3 animate-pulse">
                      <div className="aspect-video bg-brand-border rounded-md"></div>
                      <div className="flex flex-col gap-2 w-full">
                        <div className="h-4 bg-brand-border rounded w-4/5"></div>
                        <div className="h-3 bg-brand-border rounded w-3/5"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : userVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-left">
                  {userVideos.map((video) => (
                    <article 
                      key={video._id} 
                      className="bg-brand-card border border-brand-border rounded-md overflow-hidden group hover:shadow-md transition-all flex flex-col h-full"
                    >
                      <div className="aspect-video relative overflow-hidden bg-brand-bg">
                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300" />
                        <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                          {Math.floor((video.duration || 0) / 60)}:{(Math.floor((video.duration || 0) % 60) < 10 ? '0' : '') + Math.floor((video.duration || 0) % 60)}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-brand-text line-clamp-2 leading-tight group-hover:text-brand-accent transition-colors mb-1">{video.title}</h4>
                          <p className="text-[10px] text-brand-secondary">Published {new Date(video.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-brand-border/60 pt-2 text-[10px] text-brand-secondary font-medium">
                          <span>{video.views || 0} views</span>
                          <button 
                            onClick={() => handleDeleteVideo(video._id)}
                            className="p-1 hover:bg-brand-danger-bg text-brand-accent hover:text-brand-hover rounded transition-colors cursor-pointer"
                            title="Delete video"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 bg-brand-card border border-brand-border rounded-md">
                  <Video className="text-brand-secondary mb-3" size={32} />
                  <h3 className="font-bold text-sm text-brand-text">No videos uploaded yet</h3>
                  <p className="text-xs text-brand-secondary mt-1 mb-4">Click publish above to upload your first video or go live.</p>
                  <button 
                    onClick={() => setIsUploadOpen(true)}
                    className="px-4 py-2 bg-brand-accent hover:bg-brand-hover text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
                  >
                    Publish Stream
                  </button>
                </div>
              )
            )}

            {activeTab === 'playlists' && (
              <div className="flex flex-col items-center justify-center text-center p-12 bg-brand-card border border-brand-border rounded-md">
                <BookOpen className="text-brand-secondary mb-3" size={32} />
                <h3 className="font-bold text-sm text-brand-text">Playlists is coming soon</h3>
                <p className="text-xs text-brand-secondary mt-1">Organize your watch streams into custom catalog playlists.</p>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="bg-brand-card border border-brand-border rounded-md p-6 max-w-2xl text-left">
                <h3 className="font-bold text-sm text-brand-text mb-4">Channel Community Feed</h3>
                <div className="flex gap-3 mb-6">
                  <img src={user?.avatar} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                  <div className="flex-1 flex flex-col gap-2">
                    <textarea 
                      placeholder="Share an update or announcement with your subscribers..."
                      className="w-full bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md p-3 text-xs resize-none h-20"
                    />
                    <button className="self-end px-3 py-1.5 bg-brand-accent hover:bg-brand-hover text-white text-xs font-bold rounded-md transition-colors cursor-pointer">
                      Post announcement
                    </button>
                  </div>
                </div>
                <div className="border-t border-brand-border pt-4 text-xs text-brand-secondary italic text-center">
                  No community posts found. Be the first to share an update!
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="md:col-span-2 bg-brand-card border border-brand-border rounded-md p-6">
                  <h3 className="font-extrabold text-sm text-brand-text mb-3">Channel Biography</h3>
                  <p className="text-xs text-brand-secondary leading-relaxed">
                    Welcome to my VideoTube creator channel! I create tech videos, lofi playlists, programming guides, and live streams. Subscribe to stay updated with my latest uploads.
                  </p>
                </div>
                
                <div className="bg-brand-card border border-brand-border rounded-md p-6 flex flex-col gap-4">
                  <h3 className="font-extrabold text-sm text-brand-text border-b border-brand-border pb-2">Details</h3>
                  
                  <div className="flex items-center gap-3 text-xs">
                    <Mail className="text-brand-secondary" size={15} />
                    <div>
                      <p className="text-[10px] text-brand-secondary font-semibold uppercase tracking-wider">Email Address</p>
                      <p className="text-brand-text truncate font-medium mt-0.5">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <Calendar className="text-brand-secondary" size={15} />
                    <div>
                      <p className="text-[10px] text-brand-secondary font-semibold uppercase tracking-wider">Joined Platform</p>
                      <p className="text-brand-text font-medium mt-0.5">{joinedDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="flex flex-col gap-6 text-left">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-brand-card border border-brand-border rounded-md p-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Subscribers</span>
                      <h4 className="text-xl font-extrabold text-brand-text mt-1">{statsLoading ? '...' : (channelStats?.subscribersCount || 0)}</h4>
                    </div>
                    <Users className="text-brand-accent bg-red-50 p-2 rounded-md" size={36} />
                  </div>

                  <div className="bg-brand-card border border-brand-border rounded-md p-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Subscriptions</span>
                      <h4 className="text-xl font-extrabold text-brand-text mt-1">{statsLoading ? '...' : (channelStats?.channelsSubscribedToCount || 0)}</h4>
                    </div>
                    <UserCheck className="text-brand-accent bg-red-50 p-2 rounded-md" size={36} />
                  </div>

                  <div className="bg-brand-card border border-brand-border rounded-md p-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Total Video Views</span>
                      <h4 className="text-xl font-extrabold text-brand-text mt-1">{statsLoading ? '...' : (channelStats?.totalViews || 0)}</h4>
                    </div>
                    <Eye className="text-brand-accent bg-red-50 p-2 rounded-md" size={36} />
                  </div>
                </div>

                {/* Analytical Charts */}
                <div className="bg-brand-card border border-brand-border rounded-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-extrabold text-sm text-brand-text">Viewership Trends</h3>
                      <p className="text-[10px] text-brand-secondary mt-0.5">Subscriber count updates dynamically</p>
                    </div>
                    <span className="text-[10px] bg-brand-bg border border-brand-border text-brand-secondary px-2.5 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                      Live counter <ArrowUpRight size={10} />
                    </span>
                  </div>

                  {/* Horizontal Bar Chart (Spreadsheet style) */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center text-xs">
                      <span className="w-20 text-brand-secondary font-semibold">Jan - Mar</span>
                      <div className="flex-1 bg-brand-bg h-4 rounded-sm overflow-hidden border border-brand-border ml-4">
                        <div className="bg-brand-accent h-full w-[45%]" />
                      </div>
                      <span className="w-12 text-right text-brand-text font-bold ml-4">450</span>
                    </div>

                    <div className="flex items-center text-xs">
                      <span className="w-20 text-brand-secondary font-semibold">Apr - Jun</span>
                      <div className="flex-1 bg-brand-bg h-4 rounded-sm overflow-hidden border border-brand-border ml-4">
                        <div className="bg-brand-accent h-full w-[70%]" />
                      </div>
                      <span className="w-12 text-right text-brand-text font-bold ml-4">700</span>
                    </div>

                    <div className="flex items-center text-xs">
                      <span className="w-20 text-brand-secondary font-semibold">Jul - Sep</span>
                      <div className="flex-1 bg-brand-bg h-4 rounded-sm overflow-hidden border border-brand-border ml-4">
                        <div className="bg-brand-accent h-full w-[95%]" />
                      </div>
                      <span className="w-12 text-right text-brand-text font-bold ml-4">950</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                {/* Form: Details */}
                <div className="bg-brand-card border border-brand-border rounded-md p-6">
                  <h3 className="font-extrabold text-sm text-brand-text border-b border-brand-border pb-3 mb-6 flex items-center gap-2">
                    <UserIcon size={15} />
                    <span>Profile details</span>
                  </h3>
                  
                  {detailsError && <div className="mb-4 p-3 bg-brand-danger-bg border border-brand-danger-border text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2"><AlertCircle size={14} />{detailsError}</div>}
                  {detailsSuccess && <div className="mb-4 p-3 bg-brand-success-bg border border-brand-success-border text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2"><CheckCircle size={14} />{detailsSuccess}</div>}

                  <form onSubmit={handleUpdateDetails} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={detailsLoading}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={detailsLoading}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={detailsLoading}
                      className="self-start px-4 py-2 bg-brand-accent hover:bg-brand-hover text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
                    >
                      {detailsLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </form>
                </div>

                {/* Right Column Stack */}
                <div className="flex flex-col gap-8">
                  {/* Form: Appearance */}
                  <div className="bg-brand-card border border-brand-border rounded-md p-6">
                    <h3 className="font-extrabold text-sm text-brand-text border-b border-brand-border pb-3 mb-4 flex items-center gap-2">
                      <Palette size={15} />
                      <span>Appearance</span>
                    </h3>
                    <p className="text-xs text-brand-secondary leading-relaxed mb-6">
                      Choose how VideoTube looks on your device. Customize your layout colors between light, dark, and system themes.
                    </p>

                    <div className="flex bg-brand-bg border border-brand-border rounded-lg p-1 w-full relative">
                      {[
                        { id: 'light', label: 'Light' },
                        { id: 'dark', label: 'Dark' },
                        { id: 'system', label: 'System' }
                      ].map((opt) => {
                        const active = theme === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setTheme(opt.id)}
                            className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-all cursor-pointer ${
                              active 
                                ? 'bg-brand-card text-brand-accent shadow-sm' 
                                : 'text-brand-secondary hover:text-brand-text'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form: Security */}
                  <div className="bg-brand-card border border-brand-border rounded-md p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-brand-text border-b border-brand-border pb-3 mb-6 flex items-center gap-2">
                        <Shield size={15} />
                        <span>Security credentials</span>
                      </h3>
                      <p className="text-xs text-brand-secondary mb-6 leading-relaxed">
                        For security reasons, your account password should be updated periodically. Click below to manage and modify your login password on a secure standalone screen.
                      </p>
                    </div>
                    <Link 
                      to="/change-password"
                      className="self-start px-4 py-2 bg-brand-accent hover:bg-brand-hover text-white text-xs font-bold rounded-md transition-colors cursor-pointer text-center"
                    >
                      Change Account Password
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={fetchUserVideos}
      />
    </div>
  );
};

export default Profile;
