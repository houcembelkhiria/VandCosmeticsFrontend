import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Session {
  user: User;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (name: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('auth_token');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setUser(user);
        setSession({ user, access_token: storedToken } as any);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      }
    }
    
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        name,
        phone
      });

      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (name: string) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      const response = await api.put('/auth/profile', { name });

      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
