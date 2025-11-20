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
        const dashboardPath = data.user.role === 'member' ? '/member/dashboard' : '/admin/dashboard';
        navigate(dashboardPath);
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Get error message from API response
        const errorMessage = error.response?.data?.message || '';
        const statusCode = error.response?.status;
        
        // Provide clearer error messages based on the error
        let userFriendlyMessage = '';
        
        // Check for network errors first
        if (!error.response) {
          userFriendlyMessage = 'Network error. Please check your internet connection and try again.';
        } else if (statusCode === 401) {
          // Unauthorized - wrong credentials
          const lowerMessage = errorMessage.toLowerCase();
          if (lowerMessage.includes('password') || lowerMessage.includes('incorrect')) {
            userFriendlyMessage = 'Incorrect password. Please check your password and try again.';
          } else if (lowerMessage.includes('user') || lowerMessage.includes('not found') || lowerMessage.includes('username')) {
            userFriendlyMessage = 'Username not found. Please verify your username or contact your administrator.';
          } else {
            userFriendlyMessage = 'Incorrect username or password. Please check your credentials and try again.';
          }
        } else if (statusCode === 403) {
          // Forbidden - user exists but not authorized
          userFriendlyMessage = 'Access denied. You are not authorized to access this system. Please contact your administrator.';
        } else if (statusCode === 404) {
          // Not found
          userFriendlyMessage = 'User account not found. Please verify your username or contact your administrator.';
        } else if (errorMessage && errorMessage.trim().length > 0) {
          const lowerMessage = errorMessage.toLowerCase();
          if (lowerMessage.includes('not a member') || lowerMessage.includes('not registered')) {
            userFriendlyMessage = 'You are not a registered member. Please contact your administrator for access.';
          } else if (lowerMessage.includes('incorrect') || lowerMessage.includes('wrong')) {
            userFriendlyMessage = 'Incorrect information provided. Please check your username and password.';
          } else {
            // Use the API message if it's clear enough
            userFriendlyMessage = errorMessage;
          }
        } else {
          // Default fallback message
          userFriendlyMessage = 'Incorrect username or password. Please check your credentials and try again.';
        }
        
        toast.error(userFriendlyMessage);
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

