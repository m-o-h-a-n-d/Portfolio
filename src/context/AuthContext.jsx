import { useState, createContext, useContext, useEffect } from 'react';
import LoadingScreen from '../components/portfolio/LoadingScreen';
import { isAuthenticated, removeAuthToken, apiFetch, apiGet, setAuthToken, getAuthToken } from '../api/request';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_ENDPOINTS } from '../api/endpoints';
import { extractFieldErrors } from '../lib/validationErrors';
import { createEcho } from '../echo';

// Auth Context
const AuthContext = createContext(null);

// Custom hook
export const useAuth = () => useContext(AuthContext);

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const token = getAuthToken();
          if (token && !window.Echo) {
            window.Echo = createEcho(token);
          }
          const response = await apiGet(DASHBOARD_ENDPOINTS.user.list);
          const userData =
            response?.data?.user ||
            response?.user ||
            response?.data ||
            response;
          setUser(userData || null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();

    // Removed global disconnect to keep connection alive across page navigations
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiFetch(DASHBOARD_ENDPOINTS.auth.login, 'POST', { email, password });
      const token =
        response?.token ||
        response?.access_token ||
        response?.data?.token ||
        response?.data?.access_token;
      const userData = response?.user || response?.data?.user || response?.data;
      if (token) {
        setAuthToken(token);
        if (window.Echo) window.Echo.disconnect();
        window.Echo = createEcho(token);
      }
      if (userData && (response?.success ?? true)) {
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: response?.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message, fieldErrors: extractFieldErrors(error) };
    }
  };

  const logout = async () => {
    try {
      await apiFetch(DASHBOARD_ENDPOINTS.auth.logout, 'DELETE');
    } catch (error) {
    } finally {
      if (window.Echo) {
        window.Echo.disconnect();
        delete window.Echo;
      }
      removeAuthToken();
      setUser(null);
      navigate('/admin/login');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user || isAuthenticated() }}>
      {children}
    </AuthContext.Provider>
  );
};
