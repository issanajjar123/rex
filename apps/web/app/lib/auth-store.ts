import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role?: string;
  kyc_status?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  hydrate: () => void;
}

// Get initial state from localStorage (only on client)
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }
  
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user || null,
        isAuthenticated: parsed.isAuthenticated || false,
      };
    }
  } catch (error) {
    console.error('Failed to load auth from localStorage:', error);
  }
  
  return { user: null, isAuthenticated: false };
};

// Simple auth store with manual localStorage sync (for Capacitor compatibility)
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  
  hydrate: () => {
    const initial = getInitialState();
    set({ ...initial, isHydrated: true });
  },
  
  login: (user) => {
    // Store in localStorage manually for web/Capacitor
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-storage', JSON.stringify({ user, isAuthenticated: true }));
    }
    set({ user, isAuthenticated: true });
  },
  
  logout: () => {
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
    }
    set({ user: null, isAuthenticated: false });
  },
  
  updateUser: (userData) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...userData } : null;
      // Update localStorage
      if (typeof window !== 'undefined' && updatedUser) {
        localStorage.setItem('auth-storage', JSON.stringify({ user: updatedUser, isAuthenticated: true }));
      }
      return { user: updatedUser };
    }),
}));
