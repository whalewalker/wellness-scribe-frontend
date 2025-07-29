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

    try {
      const response = await authApi.login(data);
      setAuth(response.user, response.accessToken);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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