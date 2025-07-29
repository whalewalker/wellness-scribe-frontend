import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { authApi } from '../api/auth';
import { toast } from 'sonner';

export const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleResetPassword = async (data: { 
    password: string; 
    confirmPassword: string 
  }) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.resetPassword(token, data.password);
      toast.success('Password updated successfully!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <AuthForm
      type="reset-password"
      onSubmit={handleResetPassword}
      isLoading={isLoading}
      error={error}
    />
  );
};