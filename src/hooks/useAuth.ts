import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, LoginPayload, LoginResponse } from '@api/endpoints';
import { setAuthToken, removeAuthToken, setUser, getUser } from '@api/client';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  role: string;
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

        setAuthToken(data.token);
        setUser(data.user);

        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });

        toast.success('Login successful!');
        navigate('/admin/dashboard');
      } catch (error) {
        toast.error('Invalid credentials');
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

  return {
    ...authState,
    login,
    logout,
    hasRole,
    hasAnyRole,
  };
};

export default useAuth;

