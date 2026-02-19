import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const AUTHORIZED_EMAIL = 'rojas.ca.la.admi@gmail.com';

interface AuthState {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  error: string | null;
}

export function useAuth(): AuthState {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN' && session?.user?.email === AUTHORIZED_EMAIL) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === AUTHORIZED_EMAIL) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setIsAuthenticated(false);
    }
  };

  const login = (password: string): boolean => {
    return false;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setError(null);
      navigate('/rojascalaperu2025login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    isAuthenticated,
    login,
    logout,
    error
  };
}