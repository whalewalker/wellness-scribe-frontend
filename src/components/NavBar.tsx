import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Heart, MessageCircle, FileText, Settings, CreditCard, LogOut, Shield, Menu, X, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export const NavBar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine if navbar should be fixed based on current route
  const shouldBeFixed = location.pathname === '/' || location.pathname === '/landing';
  
  // Pages that need full-screen layout (auth pages)
  const isFullScreenPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    if (shouldBeFixed) {
      window.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (shouldBeFixed) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [shouldBeFixed]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/wellness-coaching', label: 'Wellness Coaching', icon: Target },
    { path: '/documents', label: 'Documents', icon: FileText },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  // Don't render navbar on full-screen auth pages
  if (isFullScreenPage) {
    return null;
  }

  return (
    <motion.nav 
      className={`${shouldBeFixed ? 'fixed' : 'sticky'} top-0 w-full z-50 transition-all duration-500 ${
        shouldBeFixed && isScrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20 shadow-lg' 
          : shouldBeFixed 
            ? 'bg-transparent' 
            : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20 shadow-sm'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <motion.span 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            WellnessAI
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {isAuthenticated ? (
            <>
              {/* Navigation Links */}
              <div className="flex items-center space-x-2">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`gap-2 relative px-4 py-2 rounded-xl transition-all duration-300 ${
                          isActivePath(item.path)
                            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                        {isActivePath(item.path) && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                            layoutId="activeTab"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                </Button>
                    </motion.div>
              </Link>
                ))}
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ring-2 ring-transparent hover:ring-blue-500/20 transition-all duration-300">
                      <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                        {user?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                  </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-gray-200/20 dark:border-gray-700/20 shadow-xl rounded-2xl" align="end" forceMount>
                  <motion.div 
                    className="flex flex-col space-y-1 p-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm font-semibold leading-none text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg capitalize">
                        {user?.tier} Plan
                      </div>
                  </div>
                  </motion.div>
                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <DropdownMenuItem 
                      onClick={() => navigate('/settings')}
                      className="mx-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-colors"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/subscribe')}
                      className="mx-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-colors"
                    >
                      <CreditCard className="mr-3 h-4 w-4" />
                    Subscription
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                      <DropdownMenuItem 
                        onClick={() => navigate('/admin')}
                        className="mx-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-colors"
                      >
                        <Shield className="mr-3 h-4 w-4" />
                      Admin
                    </DropdownMenuItem>
                  )}
                  </motion.div>
                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="mx-2 mb-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="px-6 py-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
                  >
                  Sign In
                </Button>
                </motion.div>
              </Link>
              <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                  Get Started
                </Button>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/20 dark:border-gray-700/20"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <motion.div 
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                        {user?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg capitalize mt-1">
                        {user?.tier} Plan
                      </span>
                    </div>
                  </motion.div>

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <Link 
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 p-4 rounded-2xl transition-all duration-300 ${
                            isActivePath(item.path)
                              ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400'
                              : 'hover:bg-gray-100/80 dark:hover:bg-slate-700/80'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-2 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    {[
                      { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
                      { icon: CreditCard, label: 'Subscription', action: () => navigate('/subscribe') },
                      ...(user?.isAdmin ? [{ icon: Shield, label: 'Admin', action: () => navigate('/admin') }] : []),
                    ].map((item, index) => (
                      <motion.button
                        key={item.label}
                        onClick={() => {
                          item.action();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-all duration-300 text-left"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </motion.button>
                    ))}
                    
                    <motion.button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all duration-300 text-left"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Log out</span>
                    </motion.button>
                  </div>
                </>
              ) : (
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start p-4 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-slate-700/80 transition-all duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-2xl shadow-lg transition-all duration-300"
                    >
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};