import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Lock, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const LoadingScreen = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      {/* Animated Logo */}
      <motion.div
        className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Heart className="w-10 h-10 text-white" />
      </motion.div>

      {/* Loading Text */}
      <div className="space-y-2">
        <motion.h2 
          className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your access...</p>
      </div>

      {/* Loading Dots */}
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </motion.div>
  </div>
);

const UnauthorizedScreen = ({ type }: { type: 'admin' | 'auth' }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-950 dark:via-slate-900 dark:to-orange-950 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6 max-w-md"
    >
      {/* Error Icon */}
      <motion.div
        className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
        animate={{ 
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {type === 'admin' ? (
          <Shield className="w-10 h-10 text-white" />
        ) : (
          <Lock className="w-10 h-10 text-white" />
        )}
      </motion.div>

      {/* Error Message */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {type === 'admin' ? 'Admin Access Required' : 'Authentication Required'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {type === 'admin' 
            ? 'You need administrator privileges to access this page. Please contact your system administrator if you believe this is an error.'
            : 'You need to sign in to access this page. Your session may have expired or you may not have the required permissions.'
          }
        </p>
      </div>

      {/* Action Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={() => window.location.href = type === 'admin' ? '/' : '/login'}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {type === 'admin' ? 'Go to Home' : 'Sign In'}
        </button>
      </motion.div>

      {/* Warning Icon */}
      <motion.div
        className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AlertTriangle className="w-4 h-4" />
        <span>Redirecting...</span>
      </motion.div>
    </motion.div>
  </div>
);

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // If unauthorized, show error screen briefly before redirect
      if (!isAuthenticated || (requireAdmin && !user?.isAdmin)) {
        setShowUnauthorized(true);
        setTimeout(() => {
          // Redirect after showing error
          if (!isAuthenticated) {
            window.location.href = '/login';
          } else if (requireAdmin && !user?.isAdmin) {
            window.location.href = '/';
          }
        }, 2000);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, requireAdmin]);

  // Show loading screen
  if (isLoading) {
    return (
      <LoadingScreen 
        message={requireAdmin ? "Verifying Admin Access" : "Authenticating"} 
      />
    );
  }

  // Show unauthorized screen
  if (showUnauthorized) {
    if (!isAuthenticated) {
      return <UnauthorizedScreen type="auth" />;
    }
    if (requireAdmin && !user?.isAdmin) {
      return <UnauthorizedScreen type="admin" />;
    }
  }

  // Handle redirects (fallback)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Animate the protected content in
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};