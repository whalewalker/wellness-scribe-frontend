import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Heart, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthFormProps {
  type: 'login' | 'register' | 'forgot-password' | 'reset-password';
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export const AuthForm = ({ type, onSubmit, isLoading, error, className }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTitle = () => {
    switch (type) {
      case 'login': return 'Welcome back';
      case 'register': return 'Create your account';
      case 'forgot-password': return 'Reset your password';
      case 'reset-password': return 'Set new password';
      default: return 'Welcome';
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case 'login': return 'Sign in to continue your wellness journey';
      case 'register': return 'Start your wellness journey today';
      case 'forgot-password': return 'Enter your email to receive a reset link';
      case 'reset-password': return 'Enter your new password';
      default: return '';
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary/10 p-4", className)}>
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary to-wellness rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{getTitle()}</h1>
            <p className="text-muted-foreground">{getSubtitle()}</p>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
            )}

            {(type === 'login' || type === 'register' || type === 'forgot-password') && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
            )}

            {(type === 'login' || type === 'register' || type === 'reset-password') && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {(type === 'register' || type === 'reset-password') && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-wellness hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : type === 'login' ? 'Sign In' : 
               type === 'register' ? 'Create Account' : 
               type === 'forgot-password' ? 'Send Reset Link' : 'Update Password'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-sm">
          {type === 'login' && (
            <>
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot your password?
              </Link>
              <div>
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </>
          )}
          
          {type === 'register' && (
            <div>
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          )}

          {type === 'forgot-password' && (
            <Link to="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};