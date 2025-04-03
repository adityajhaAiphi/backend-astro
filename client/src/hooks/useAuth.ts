import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await fetch("https://astroalert-backend-m1hn.onrender.com/api/auth/verify", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Invalid token');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/sign-in');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`https://astroalert-backend-m1hn.onrender.com/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/sign-in');
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    getToken: () => localStorage.getItem('token'),
    signOut,
    isAuthenticated: !!user,
    isAdmin
  };
} 