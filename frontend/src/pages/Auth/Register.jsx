import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import { Upload, AlertCircle, CheckCircle, Image as ImageIcon, Camera } from 'lucide-react';

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

    // Basic validation
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
    <div className="auth-container" style={{ minHeight: '120vh' }}>
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Register to share and vibe with streams</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              className="form-input"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="e.g. johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="file-upload-grid">
            {/* Avatar Uploader */}
            <div className="file-uploader" onClick={() => avatarInputRef.current?.click()}>
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
                  <img src={avatarPreview} alt="Avatar Preview" className="file-preview" />
                  <span className="file-uploader-text" style={{ marginTop: '8px' }}>Change Avatar</span>
                </>
              ) : (
                <>
                  <Camera className="file-uploader-icon" size={24} />
                  <span className="file-uploader-text">Upload Avatar *</span>
                </>
              )}
            </div>

            {/* Cover Image Uploader */}
            <div className="file-uploader" onClick={() => coverInputRef.current?.click()}>
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
                  <img src={coverPreview} alt="Cover Preview" className="file-preview rect" />
                  <span className="file-uploader-text" style={{ marginTop: '8px' }}>Change Cover</span>
                </>
              ) : (
                <>
                  <ImageIcon className="file-uploader-icon" size={24} />
                  <span className="file-uploader-text">Cover Image (Optional)</span>
                </>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
