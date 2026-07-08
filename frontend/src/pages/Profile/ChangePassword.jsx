import React, { useState } from 'react';
import { 
  Home, 
  User as UserIcon, 
  History, 
  LogOut, 
  Shield, 
  Menu, 
  PlusCircle, 
  Bell, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import UploadModal from '../../components/UploadModal';

const ChangePassword = ({ user, handleLogout }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword) {
      setError('Please fill in both fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/users/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      setSuccess('Password updated successfully! Redirecting...');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to change password. Ensure old password is correct.');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Action Controls */}
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

            <div className="border-t border-brand-border pt-4">
              <h3 className="px-3 text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-2">My Channel</h3>
              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <img src={user.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                  <span className="text-xs text-brand-text truncate">@{user.username}</span>
                </div>
              )}
            </div>
          </div>

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
        <main className="flex-1 p-6 md:p-8 max-w-lg mx-auto w-full text-left">
          {/* Back button */}
          <button 
            onClick={() => navigate('/profile')} 
            className="flex items-center gap-1 text-xs font-semibold text-brand-secondary hover:text-brand-text mb-6 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Creator Studio</span>
          </button>

          {/* Settings Card */}
          <div className="bg-brand-card border border-brand-border rounded-md p-6 sm:p-8 shadow-sm">
            <h1 className="font-extrabold text-lg text-brand-text mb-2 flex items-center gap-2">
              <Shield size={16} className="text-brand-accent" />
              <span>Change Security Password</span>
            </h1>
            <p className="text-xs text-brand-secondary mb-6 border-b border-brand-border pb-3">Update your VideoTube account password below</p>

            {error && (
              <div className="mb-4 p-3 bg-brand-danger-bg border border-brand-danger-border text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-brand-success-bg border border-brand-success-border text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2">
                <CheckCircle size={14} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Current Password</label>
                <input 
                  type="password" 
                  className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">New Password</label>
                <input 
                  type="password" 
                  className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-brand-accent hover:bg-brand-hover text-white text-xs font-bold py-2.5 px-4 rounded-md transition-colors cursor-pointer flex items-center justify-center mt-2"
              >
                {loading ? 'Updating password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </main>
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={() => {}}
      />
    </div>
  );
};

export default ChangePassword;
