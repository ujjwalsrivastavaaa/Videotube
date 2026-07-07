import React, { useState, useEffect, useRef } from 'react';
import { Home, User as UserIcon, History, LogOut, Camera, Image as ImageIcon, Users, UserCheck, Mail, Calendar, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';

const Profile = ({ user, setUser, handleLogout }) => {
  // Stats state
  const [channelStats, setChannelStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Forms state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI state
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

  // Format creation timestamp
  const joinedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : 'Unknown';

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
            <li className="nav-link-item active">
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

      {/* Main Panel */}
      <main className="app-main">
        {/* Hidden inputs for file uploads */}
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

        {/* Cover Banner */}
        <div 
          className="profile-banner" 
          style={{ backgroundImage: `url(${user?.coverImage || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80"})` }}
        >
          <button 
            className="profile-banner-edit" 
            onClick={() => coverInputRef.current?.click()}
            disabled={coverLoading}
          >
            <ImageIcon size={14} />
            <span>{coverLoading ? 'Uploading...' : 'Update Cover'}</span>
          </button>

          {/* Avatar Container */}
          <div className="profile-avatar-container">
            <div className="profile-avatar-wrapper">
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"} 
                alt="Avatar" 
                className="profile-avatar" 
              />
              <button 
                className="profile-avatar-edit" 
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarLoading}
                title="Change Avatar"
              >
                <Camera size={14} />
              </button>
            </div>
            <div className="profile-meta">
              <h2>{user?.fullName}</h2>
              <p>@{user?.username}</p>
            </div>
          </div>
        </div>

        {/* Error notification for file upload */}
        {avatarError && <div className="alert alert-danger" style={{ marginTop: '10px' }}><AlertCircle size={16} />{avatarError}</div>}
        {avatarSuccess && <div className="alert alert-success" style={{ marginTop: '10px' }}><CheckCircle size={16} />{avatarSuccess}</div>}
        {coverError && <div className="alert alert-danger" style={{ marginTop: '10px' }}><AlertCircle size={16} />{coverError}</div>}
        {coverSuccess && <div className="alert alert-success" style={{ marginTop: '10px' }}><CheckCircle size={16} />{coverSuccess}</div>}

        {/* Channel Statistics Grid */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '600' }}>Channel Analytics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><Users size={20} /></div>
              <div>
                <div className="stat-value">{statsLoading ? '...' : (channelStats?.subscribersCount || 0)}</div>
                <div className="stat-label">Subscribers</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><UserCheck size={20} /></div>
              <div>
                <div className="stat-value">{statsLoading ? '...' : (channelStats?.channelsSubscribedToCount || 0)}</div>
                <div className="stat-label">Subscriptions</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><Mail size={20} /></div>
              <div>
                <div className="stat-value" style={{ fontSize: '14px', wordBreak: 'break-all' }}>{user?.email}</div>
                <div className="stat-label">Verified Email</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><Calendar size={20} /></div>
              <div>
                <div className="stat-value" style={{ fontSize: '14px' }}>{joinedDate}</div>
                <div className="stat-label">Joined VibeStream</div>
              </div>
            </div>
          </div>
        </section>

        {/* Forms layout */}
        <div className="settings-grid">
          {/* Form: Account Details */}
          <div className="settings-card">
            <h3>Update Profile Information</h3>
            {detailsError && <div className="alert alert-danger"><AlertCircle size={16} />{detailsError}</div>}
            {detailsSuccess && <div className="alert alert-success"><CheckCircle size={16} />{detailsSuccess}</div>}
            
            <form onSubmit={handleUpdateDetails}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={detailsLoading}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={detailsLoading}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={detailsLoading} style={{ marginTop: '10px' }}>
                {detailsLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Form: Change Password */}
          <div className="settings-card">
            <h3>Security Settings</h3>
            {passwordError && <div className="alert alert-danger"><AlertCircle size={16} />{passwordError}</div>}
            {passwordSuccess && <div className="alert alert-success"><CheckCircle size={16} />{passwordSuccess}</div>}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Old Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={passwordLoading}
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={passwordLoading} style={{ marginTop: '10px' }}>
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
