/**
 * AuthContext - Global user authentication state
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('qm_token'));
  const [loading, setLoading] = useState(true);

  const verify = useCallback(async (t) => {
    const tkn = t || token;
    if (!tkn) { setLoading(false); return; }

    try {
      const { data } = await api.post('/auth/verify', { token: tkn });
      if (data.valid) {
        setUser(data.user);
        setToken(tkn);
        localStorage.setItem('qm_token', tkn);
        localStorage.setItem('qm_userId', data.user._id);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search);
    const callbackToken = params.get('token');
    const callbackUserId = params.get('userId');

    if (callbackToken && callbackUserId) {
      localStorage.setItem('qm_token', callbackToken);
      localStorage.setItem('qm_userId', callbackUserId);
      window.history.replaceState({}, '', window.location.pathname);
      verify(callbackToken);
    } else {
      verify();
    }
  }, []); // eslint-disable-line

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('qm_token');
    localStorage.removeItem('qm_userId');
  }, []);

  const loginWithGoogle = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithGoogle, logout, updateUser, verify }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
