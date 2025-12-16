import { useState, useEffect } from 'react';

// Contraseña maestra (en producción, esto debería estar en variables de entorno)
const ADMIN_PASSWORD = 'RojasCala2025!';
const AUTH_KEY = 'rojas_cala_admin_auth';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

interface AuthState {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  error: string | null;
}

export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar si hay una sesión válida al cargar
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    try {
      const authData = localStorage.getItem(AUTH_KEY);
      if (authData) {
        const { timestamp, authenticated } = JSON.parse(authData);
        const now = Date.now();
        
        // Verificar si la sesión no ha expirado
        if (authenticated && (now - timestamp) < SESSION_DURATION) {
          setIsAuthenticated(true);
          return;
        } else {
          // Sesión expirada, limpiar
          localStorage.removeItem(AUTH_KEY);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
      localStorage.removeItem(AUTH_KEY);
    }
    
    setIsAuthenticated(false);
  };

  const login = (password: string): boolean => {
    setError(null);
    
    // Validar que la contraseña no esté vacía
    if (!password || password.trim() === '') {
      setError('Por favor ingresa la contraseña.');
      return false;
    }
    
    if (password === ADMIN_PASSWORD) {
      const authData = {
        authenticated: true,
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        setIsAuthenticated(true);
        console.log('Login successful'); // Debug log
        return true;
      } catch (error) {
        console.error('Error saving session:', error);
        setError('Error al guardar la sesión. Intenta nuevamente.');
        return false;
      }
    } else {
      setError('Contraseña incorrecta. Verifica e intenta nuevamente.');
      return false;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_KEY);
      setIsAuthenticated(false);
      setError(null);
      console.log('Logout successful'); // Debug log
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