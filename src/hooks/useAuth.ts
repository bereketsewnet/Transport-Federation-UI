import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, LoginPayload, LoginResponse } from '@api/endpoints';
import { setAuthToken, removeAuthToken, setUser, getUser } from '@api/client';
import { toast } from 'react-hot-toast';

export interface User {
  id: number;
  username: string;
  role: string;
  mem_id?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = getUser() as User | null;
    if (storedUser) {
      setAuthState({
        user: storedUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginPayload) => {
      try {
        const response = await loginApi(credentials);
        const data: LoginResponse = response.data;

        console.log('Login response:', data);

        // Check if password change is required (first-time login)
        if (data.requirePasswordChange && data.tempToken) {
          setAuthToken(data.tempToken);
          toast(data.message || 'Password change required', {
            icon: 'ℹ️',
            duration: 4000,
          });
          navigate('/change-password');
          return;
        }

        // Normal login flow
        if (!data.token || !data.user) {
          console.error('Invalid login response:', data);
          toast.error('Invalid login response from server');
          return;
        }

        setAuthToken(data.token);
        setUser(data.user);

        setAuthState({
          user: data.user as User,
          isAuthenticated: true,
          isLoading: false,
        });

        toast.success('Login successful!');
        
        // Navigate based on role
        if (data.user.role === 'member') {
          navigate('/member/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      } catch (error: any) {
        console.error('Login error:', error);
        toast.error(error.response?.data?.message || 'Invalid credentials');
        throw error;
      }
    },
    [navigate]
  );

  const logout = useCallback(() => {
    removeAuthToken();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    navigate('/login');
    toast.success('Logged out successfully');
  }, [navigate]);

  const hasRole = useCallback(
    (role: string) => {
      return authState.user?.role === role;
    },
    [authState.user]
  );

  const hasAnyRole = useCallback(
    (roles: string[]) => {
      return authState.user ? roles.includes(authState.user.role) : false;
    },
    [authState.user]
  );

  const updateUser = useCallback((user: User | null) => {
    setUser(user);
    setAuthState((prev) => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  }, []);

  const updateToken = useCallback((token: string | null) => {
    if (token) {
      setAuthToken(token);
    } else {
      removeAuthToken();
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    hasRole,
    hasAnyRole,
    setUser: updateUser,
    setToken: updateToken,
  };
};

export default useAuth;

