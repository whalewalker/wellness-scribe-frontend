import { useState } from 'react';
import { AuthForm } from '../components/AuthForm';
import { authApi } from '../api/auth';
import { toast } from 'sonner';

export const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async (data: { email: string }) => {
    setIsLoading(true);
    setError('');

    try {
      await authApi.forgotPassword(data.email);
      setSuccess(true);
      toast.success('Reset link sent to your email!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary/10 p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">📧</span>
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground max-w-md">
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthForm
      type="forgot-password"
      onSubmit={handleForgotPassword}
      isLoading={isLoading}
      error={error}
    />
  );
};