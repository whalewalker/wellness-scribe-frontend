import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleRegister = async (data: { 
    name: string; 
    email: string; 
    password: string; 
    confirmPassword: string 
  }) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(response.user, response.accessToken);
      toast.success('Account created successfully!');
      navigate('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      type="register"
      onSubmit={handleRegister}
      isLoading={isLoading}
      error={error}
    />
  );
};