import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Create context
const AuthContext = createContext();

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
  isAuthenticated: false
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
        isAuthenticated: true
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
        isAuthenticated: false
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
        isAuthenticated: false
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Setup axios interceptors
  useEffect(() => {
    // Request interceptor to add token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Try to refresh token
          try {
            const refreshResponse = await axios.post('/api/auth/refresh-token');
            const newToken = refreshResponse.data.data.token;
            
            // Update token in state
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: state.user,
                token: newToken
              }
            });

            // Store in localStorage
            localStorage.setItem('token', newToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
            toast.error('Session expired. Please login again.');
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [state.token, state.user]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      try {
        // Verify token with backend
        const response = await axios.get('/api/auth/verify-token', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const { user } = response.data.data;
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user, token }
          });
        } else {
          localStorage.removeItem('token');
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials, userType = 'patient') => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const endpoint = `/api/auth/${userType}/login`;
      const response = await axios.post(endpoint, credentials);

      if (response.data.success) {
        const { token } = response.data.data;
        const user = response.data.data[userType];
        
        // Add userType to user object
        const userWithType = { ...user, userType };

        // Store token in localStorage
        localStorage.setItem('token', token);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: userWithType, token }
        });

        toast.success(`Welcome back, ${user.firstName}!`);
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData, userType = 'patient') => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const endpoint = `/api/auth/${userType}/register`;
      const response = await axios.post(endpoint, userData);

      if (response.data.success) {
        const { token } = response.data.data;
        const user = response.data.data[userType];
        
        // Add userType to user object
        const userWithType = { ...user, userType };

        // Store token in localStorage (for patients, auto-login after registration)
        if (userType === 'patient') {
          localStorage.setItem('token', token);
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: userWithType, token }
          });

          toast.success('Registration successful! Welcome to Arogya Card!');
        } else {
          // For doctors, don't auto-login (need verification)
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          toast.success('Registration submitted. Please wait for admin verification.');
        }

        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint (optional)
      if (state.token) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('token');
      
      // Clear state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      toast.info('Logged out successfully');
    }
  };

  // Update user profile
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Forgot password
  const forgotPassword = async (email, userType = 'patient') => {
    try {
      const endpoint = `/api/auth/${userType}/forgot-password`;
      const response = await axios.post(endpoint, { email });

      if (response.data.success) {
        toast.success('Password reset instructions sent to your email');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password
  const resetPassword = async (token, password, userType = 'patient') => {
    try {
      const endpoint = `/api/auth/${userType}/reset-password/${token}`;
      const response = await axios.put(endpoint, { password });

      if (response.data.success) {
        toast.success('Password reset successful');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get current user profile
  const getCurrentUser = async () => {
    if (!state.user || !state.token) return null;

    try {
      const endpoint = `/api/auth/${state.user.userType}/me`;
      const response = await axios.get(endpoint);

      if (response.data.success) {
        const userData = response.data.data[state.user.userType];
        const userWithType = { ...userData, userType: state.user.userType };
        
        updateUser(userWithType);
        return userWithType;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!state.user) return false;

    switch (state.user.userType) {
      case 'admin':
        return true; // Admin has all permissions
      case 'doctor':
        return state.user.permissions?.[permission] || false;
      case 'patient':
        return permission === 'view_own_records';
      default:
        return false;
    }
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,

    // Actions
    login,
    register,
    logout,
    updateUser,
    clearError,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;