import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ccmms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('ccmms_token') || null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('ccmms_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.success && response.data) {
          setUser(response.data);
          localStorage.setItem('ccmms_user', JSON.stringify(response.data));
        }
      } catch (err) {
        console.warn('[AuthContext] Session invalid or expired');
        localStorage.removeItem('ccmms_token');
        localStorage.removeItem('ccmms_user');
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authApi.login(email, password);
      if (result.success && result.data) {
        const { user: loggedInUser, accessToken: token } = result.data;
        setUser(loggedInUser);
        setAccessToken(token);
        localStorage.setItem('ccmms_user', JSON.stringify(loggedInUser));
        localStorage.setItem('ccmms_token', token);
        toast.success(`Welcome back, ${loggedInUser.name.split(' ')[0]}!`);
        return loggedInUser;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const result = await authApi.register(userData);
      if (result.success && result.data) {
        const { user: registeredUser, accessToken: token } = result.data;
        setUser(registeredUser);
        setAccessToken(token);
        localStorage.setItem('ccmms_user', JSON.stringify(registeredUser));
        localStorage.setItem('ccmms_token', token);
        toast.success('Registration successful! Welcome to CCMMS.');
        return registeredUser;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (_) {}
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('ccmms_token');
    localStorage.removeItem('ccmms_user');
    toast.success('Logged out successfully');
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('ccmms_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        role: user?.role || null,
        isAuthenticated: Boolean(user && accessToken),
        isLoading,
        login,
        register,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

