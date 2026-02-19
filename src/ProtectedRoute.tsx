import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import { LoadingSpinner } from './LoadingSpinner';

const AUTHORIZED_EMAIL = 'rojas.ca.la.admi@gmail.com';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthorized(false);
      } else if (event === 'SIGNED_IN' && session?.user?.email === AUTHORIZED_EMAIL) {
        setIsAuthorized(true);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email === AUTHORIZED_EMAIL) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/rojascalaperu2025login" replace />;
  }

  return <>{children}</>;
}
