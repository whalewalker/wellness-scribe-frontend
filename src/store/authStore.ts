import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  // Computed properties for backward compatibility
  name?: string;
  avatar?: string;
  tier?: 'free' | 'premium' | 'business';
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token) => {
        console.log('Setting auth with user:', user, 'token:', token);
        
        // Add computed properties for backward compatibility
        const userWithComputed = {
          ...user,
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.profilePicture,
          tier: 'free' as const, // Default tier
          isAdmin: user.role === 'admin',
        };
        
        console.log('User with computed properties:', userWithComputed);
        
        localStorage.setItem('accessToken', token);
        set({ 
          user: userWithComputed, 
          accessToken: token, 
          isAuthenticated: true,
          isLoading: false 
        });
      },

      logout: () => {
        console.log('Logging out');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        set({ 
          user: null, 
          accessToken: null, 
          isAuthenticated: false,
          isLoading: false 
        });
        
        // Use React Router navigation instead of window.location
        // This will be handled by the ProtectedRoute component
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          // Recompute computed properties
          updatedUser.name = `${updatedUser.firstName} ${updatedUser.lastName}`;
          updatedUser.avatar = updatedUser.profilePicture;
          updatedUser.isAdmin = updatedUser.role === 'admin';
          
          set({ user: updatedUser });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);