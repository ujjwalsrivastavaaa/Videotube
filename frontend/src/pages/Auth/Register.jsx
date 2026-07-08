import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import { AlertCircle, CheckCircle, Camera, Image as ImageIcon } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  
  // File states
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  
  // File preview URLs
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !email || !fullName || !password) {
      setError('Please fill in all textual fields');
      return;
    }
    if (!avatar) {
      setError('Avatar image is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username.trim());
      formData.append('email', email.trim());
      formData.append('fullName', fullName.trim());
      formData.append('password', password);
      formData.append('avatar', avatar);
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      await apiRequest('/users/register', {
        method: 'POST',
        body: formData
      });

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-bg px-6 py-12 font-sans selection:bg-brand-accent selection:text-white">
      <div className="w-full max-w-[480px] bg-brand-card border border-brand-border rounded-md p-8 sm:p-10 shadow-sm text-left">
        
        {/* Header */}
        <div className="mb-6">
          <Link to="/" className="flex items-center gap-2 group select-none mb-3">
            <div className="bg-brand-accent group-hover:bg-brand-hover text-white w-7 h-7 rounded-sm flex items-center justify-center font-black text-sm tracking-tighter transition-colors">
              VT
            </div>
            <span className="font-extrabold text-lg tracking-tight text-brand-text">
              VideoTube
            </span>
          </Link>
          <h1 className="text-xl font-extrabold text-brand-text tracking-tight">Create Channel Account</h1>
          <p className="text-xs text-brand-secondary mt-1">Register to start uploading your streams on VideoTube</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-brand-danger-bg border border-brand-danger-border text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 bg-brand-success-bg border border-brand-success-border text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2">
            <CheckCircle size={15} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 my-2">
            {/* Avatar Input */}
            <div 
              onClick={() => !loading && avatarInputRef.current?.click()} 
              className="border border-dashed border-brand-border hover:border-brand-accent hover:bg-brand-accent/5 rounded-md p-4 flex flex-col items-center justify-center min-h-[110px] cursor-pointer transition-colors text-center relative"
            >
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={loading}
                className="hidden-file-input"
              />
              {avatarPreview ? (
                <>
                  <img src={avatarPreview} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-brand-border" />
                  <span className="text-[9px] font-bold text-brand-accent mt-2">Change Avatar</span>
                </>
              ) : (
                <>
                  <Camera size={20} className="text-brand-secondary" />
                  <span className="text-[10px] font-bold text-brand-text mt-2">Avatar *</span>
                  <span className="text-[9px] text-brand-secondary mt-0.5">Profile image</span>
                </>
              )}
            </div>

            {/* Cover Image Input */}
            <div 
              onClick={() => !loading && coverInputRef.current?.click()} 
              className="border border-dashed border-brand-border hover:border-brand-accent hover:bg-brand-accent/5 rounded-md p-4 flex flex-col items-center justify-center min-h-[110px] cursor-pointer transition-colors text-center relative"
            >
              <input
                type="file"
                ref={coverInputRef}
                accept="image/*"
                onChange={handleCoverChange}
                disabled={loading}
                className="hidden-file-input"
              />
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover" className="w-16 h-10 object-cover rounded-sm border border-brand-border" />
                  <span className="text-[9px] font-bold text-brand-accent mt-2">Change Cover</span>
                </>
              ) : (
                <>
                  <ImageIcon size={20} className="text-brand-secondary" />
                  <span className="text-[10px] font-bold text-brand-text mt-2">Cover Banner</span>
                  <span className="text-[9px] text-brand-secondary mt-0.5">Optional</span>
                </>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-accent hover:bg-brand-hover text-white text-xs font-bold py-2.5 px-4 rounded-md transition-colors cursor-pointer flex items-center justify-center mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-brand-secondary border-t border-brand-border/60 pt-6">
          Already have an account? <Link to="/login" className="text-brand-accent font-semibold hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
