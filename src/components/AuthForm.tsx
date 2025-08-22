import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Heart, Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthFormProps {
  type: 'login' | 'register' | 'forgot-password' | 'reset-password';
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export const AuthForm = ({ type, onSubmit, isLoading, error, className }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let submitData: any = {};
    
    switch (type) {
      case 'login':
        submitData = {
          email: formData.email,
          password: formData.password,
        };
        break;
      case 'register':
        submitData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        };
        break;
      case 'forgot-password':
        submitData = {
          email: formData.email,
        };
        break;
      case 'reset-password':
        submitData = {
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        };
        break;
    }
    
    onSubmit(submitData);
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

  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    switch (type) {
      case 'login': return 'Sign In';
      case 'register': return 'Create Account';
      case 'forgot-password': return 'Send Reset Link';
      case 'reset-password': return 'Update Password';
      default: return 'Submit';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 p-4 relative overflow-hidden", className)}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        <Card className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 shadow-2xl">
          <CardHeader className="space-y-6 text-center pb-8">
            <motion.div variants={itemVariants}>
              <motion.div 
                className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
            
            <motion.div className="space-y-3" variants={itemVariants}>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {getTitle()}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {getSubtitle()}
              </p>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered</span>
              </div>
            </motion.div>
          </CardHeader>

          <CardContent className="pb-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form onSubmit={handleSubmit} className="space-y-6" variants={itemVariants}>
              {type === 'register' && (
                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField(null)}
                        className="pl-10 h-12 rounded-xl transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                        className="pl-10 h-12 rounded-xl transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {(type === 'login' || type === 'register' || type === 'forgot-password') && (
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: type === 'register' ? 0.3 : 0.2 }}
                >
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 h-12 rounded-xl transition-all duration-300"
                      required
                    />
                  </div>
                </motion.div>
              )}

              {(type === 'login' || type === 'register' || type === 'reset-password') && (
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: type === 'register' ? 0.4 : 0.3 }}
                >
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 pr-12 h-12 rounded-xl transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}

              {(type === 'register' || type === 'reset-password') && (
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-10 pr-12 h-12 rounded-xl transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {getButtonText()}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 text-center text-sm pt-0">
            <motion.div variants={itemVariants}>
              {type === 'login' && (
                <div className="space-y-3">
                  <Link 
                    to="/forgot-password" 
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    Forgot your password?
                  </Link>
                  <div className="text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              )}
              
              {type === 'register' && (
                <div className="text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              )}

              {type === 'forgot-password' && (
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
                >
                  Back to sign in
                </Link>
              )}
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};