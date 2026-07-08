import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, setAuthToken, setRefreshToken } from '../../utils/api';
import { AlertCircle } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-screen bg-brand-bg px-6 py-10 font-sans selection:bg-brand-accent selection:text-white">
      <div className="w-full max-w-[450px] bg-brand-card border border-brand-border rounded-md p-8 sm:p-10 shadow-sm text-left">
        
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2 group select-none mb-3">
            <div className="bg-brand-accent group-hover:bg-brand-hover text-white w-7 h-7 rounded-sm flex items-center justify-center font-black text-sm tracking-tighter transition-colors">
              VT
            </div>
            <span className="font-extrabold text-lg tracking-tight text-brand-text">
              VideoTube
            </span>
          </Link>
          <h1 className="text-xl font-extrabold text-brand-text tracking-tight">Welcome Back</h1>
          <p className="text-xs text-brand-secondary mt-1">Sign in to publish streams and join the channel community</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-brand-danger-bg border border-brand-danger-border text-brand-accent text-xs font-semibold rounded-md flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="identifier" className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Username or Email</label>
            <input
              type="text"
              id="identifier"
              placeholder="Enter your username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="bg-brand-bg border border-brand-border focus:border-brand-text focus:outline-none rounded-md px-3 py-2 text-xs transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-accent hover:bg-brand-hover text-white text-xs font-bold py-2.5 px-4 rounded-md transition-colors cursor-pointer flex items-center justify-center mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-brand-secondary border-t border-brand-border/60 pt-6">
          Don't have an account? <Link to="/register" className="text-brand-accent font-semibold hover:underline">Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
