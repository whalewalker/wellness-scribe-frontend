import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const from = location.state?.from?.pathname || '/chat';

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError('');

    console.log('Login data:', data);

    try {
      const response = await authApi.login(data);
      console.log('Login response:', response);
      
      // Ensure we have the required fields
      if (!response.user) {
        throw new Error('User data missing from server response');
      }
      
      if (!response.access_token) {
        throw new Error('Access token missing from server response');
      }
      
      setAuth(response.user, response.access_token);
      toast.success('Welcome back!');
      
      // Add a small delay to ensure auth state is properly set
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      type="login"
      onSubmit={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
};