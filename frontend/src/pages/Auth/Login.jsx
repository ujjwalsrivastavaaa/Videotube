import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, setAuthToken, setRefreshToken } from '../../utils/api';
import { LogIn, Key, Mail, User, AlertCircle } from 'lucide-react';

const Login = ({ setUser }) => {
  const [identifier, setIdentifier] = useState(''); // username or email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Backend expects either username or email
      const isEmail = identifier.includes('@');
      const body = {
        password,
        [isEmail ? 'email' : 'username']: identifier
      };

      const response = await apiRequest('/users/login', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      if (response && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        setAuthToken(accessToken);
        setRefreshToken(refreshToken);
        setUser(user);
        navigate('/');
      } else {
        throw new Error('Invalid server response');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>VibeStream</h1>
          <p>Login to access your premium video dashboard</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Username or Email</label>
            <input
              type="text"
              id="identifier"
              className="form-input"
              placeholder="e.g. johndoe or john@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one now</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
