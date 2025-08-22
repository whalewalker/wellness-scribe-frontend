import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';

export const useAuthCheck = () => {
  const { setAuth, logout, setLoading, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      // If we already have a user and token, don't re-check
      if (isAuthenticated && user && token) {
        setLoading(false);
        return;
      }
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const user = await authApi.getProfile();
        setAuth(user, token);
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setAuth, logout, setLoading, isAuthenticated, user]);
};