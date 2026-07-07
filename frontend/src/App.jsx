import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { apiRequest, removeAuthToken, removeRefreshToken, getAuthToken } from './utils/api';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import WatchHistory from './pages/Dashboard/WatchHistory';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to load current user on mount
  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest('/users/current-user', { method: 'GET' });
        if (response && response.data) {
          setUser(response.data);
        } else {
          // Token is invalid/expired
          removeAuthToken();
          removeRefreshToken();
        }
      } catch (err) {
        console.error("Failed to load current user:", err.message);
        // Clear tokens if request fails
        removeAuthToken();
        removeRefreshToken();
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest('/users/logout', { method: 'POST' });
    } catch (err) {
      console.error("Failed to logout from server:", err.message);
    } finally {
      // Always clear local session
      removeAuthToken();
      removeRefreshToken();
      setUser(null);
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" replace /> : <Login setUser={setUser} />
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? <Navigate to="/" replace /> : <Register />
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Dashboard user={user} handleLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Profile user={user} setUser={setUser} handleLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/history" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <WatchHistory user={user} handleLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Fallback redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
