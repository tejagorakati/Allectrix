import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      lastActivity: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      // Login function
      login: async (credentials, userType) => {
        set({ isLoading: true });
        
        try {
          const endpoint = userType === 'Doctor' ? '/auth/doctor/login' : '/auth/patient/login';
          const response = await axios.post(endpoint, credentials);
          
          if (response.data.success) {
            const { user, token } = response.data.data;
            
            // Set authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              lastActivity: new Date().toISOString()
            });

            toast.success(`Welcome back, ${user.firstName}!`);
            return { success: true, user, token };
          } else {
            throw new Error(response.data.message || 'Login failed');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Login failed';
          toast.error(message);
          set({ isLoading: false });
          return { success: false, error: message };
        }
      },

      // Register function
      register: async (userData, userType) => {
        set({ isLoading: true });
        
        try {
          const endpoint = userType === 'Doctor' ? '/auth/doctor/register' : '/patients/register';
          const response = await axios.post(endpoint, userData);
          
          if (response.data.success) {
            const { patient, healthCard } = response.data.data;
            
            set({ isLoading: false });
            toast.success('Registration successful! Please check your email for verification.');
            
            return { 
              success: true, 
              patient, 
              healthCard,
              message: 'Registration successful! You can now login with your credentials.'
            };
          } else {
            throw new Error(response.data.message || 'Registration failed');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Registration failed';
          toast.error(message);
          set({ isLoading: false });
          return { success: false, error: message };
        }
      },

      // Logout function
      logout: () => {
        // Clear authorization header
        delete axios.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          lastActivity: null
        });

        toast.success('Logged out successfully');
      },

      // Refresh token
      refreshToken: async () => {
        const { token } = get();
        
        if (!token) return false;

        try {
          const response = await axios.post('/auth/refresh', { token });
          
          if (response.data.success) {
            const { token: newToken } = response.data.data;
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            set({ token: newToken });
            
            return true;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
        }
        
        return false;
      },

      // Check authentication status
      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return false;
        }

        try {
          // Set token in header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token with server
          const response = await axios.get('/auth/verify');
          
          if (response.data.success) {
            set({
              user: response.data.data.user,
              isAuthenticated: true,
              isLoading: false,
              lastActivity: new Date().toISOString()
            });
            return true;
          } else {
            throw new Error('Token verification failed');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          get().logout();
          set({ isLoading: false });
          return false;
        }
      },

      // Update user profile
      updateProfile: async (profileData) => {
        set({ isLoading: true });
        
        try {
          const { user } = get();
          const endpoint = user.userType === 'Doctor' ? '/doctors/profile' : '/patients/profile';
          
          const response = await axios.put(endpoint, profileData);
          
          if (response.data.success) {
            const updatedUser = response.data.data.user || response.data.data.patient || response.data.data.doctor;
            
            set({
              user: { ...user, ...updatedUser },
              isLoading: false
            });

            toast.success('Profile updated successfully');
            return { success: true, user: updatedUser };
          } else {
            throw new Error(response.data.message || 'Profile update failed');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Profile update failed';
          toast.error(message);
          set({ isLoading: false });
          return { success: false, error: message };
        }
      },

      // Change password
      changePassword: async (passwordData) => {
        set({ isLoading: true });
        
        try {
          const response = await axios.put('/auth/change-password', passwordData);
          
          if (response.data.success) {
            set({ isLoading: false });
            toast.success('Password changed successfully');
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Password change failed');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Password change failed';
          toast.error(message);
          set({ isLoading: false });
          return { success: false, error: message };
        }
      },

      // Update last activity
      updateActivity: () => {
        set({ lastActivity: new Date().toISOString() });
      },

      // Clear errors
      clearErrors: () => {
        // Clear any error states if needed
      },

      // Emergency access
      emergencyAccess: async (emergencyData) => {
        set({ isLoading: true });
        
        try {
          const response = await axios.post('/emergency/access', emergencyData);
          
          if (response.data.success) {
            const { accessToken, patientData } = response.data.data;
            
            set({
              isAuthenticated: true,
              isLoading: false,
              user: {
                userType: 'Emergency',
                isEmergencyAccess: true,
                accessToken
              }
            });

            toast.success('Emergency access granted');
            return { success: true, patientData };
          } else {
            throw new Error(response.data.message || 'Emergency access failed');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Emergency access failed';
          toast.error(message);
          set({ isLoading: false });
          return { success: false, error: message };
        }
      },

      // Session management
      extendSession: async () => {
        const { token } = get();
        
        if (!token) return false;

        try {
          const response = await axios.post('/auth/extend-session');
          
          if (response.data.success) {
            set({ lastActivity: new Date().toISOString() });
            return true;
          }
        } catch (error) {
          console.error('Session extension failed:', error);
        }
        
        return false;
      },

      // Check if session is valid
      isSessionValid: () => {
        const { lastActivity, isAuthenticated } = get();
        
        if (!isAuthenticated || !lastActivity) return false;

        const now = new Date();
        const lastActivityDate = new Date(lastActivity);
        const diffInMinutes = (now - lastActivityDate) / (1000 * 60);

        // Session expires after 30 minutes of inactivity
        return diffInMinutes < 30;
      }
    }),
    {
      name: 'arogya-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity
      }),
      onRehydrateStorage: () => (state) => {
        // Re-initialize axios header if token exists
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
        
        // Check session validity on rehydration
        if (state?.isSessionValid && !state.isSessionValid()) {
          state.logout();
        }
      }
    }
  )
);

// Set up axios interceptors for automatic token handling
axios.interceptors.request.use(
  (config) => {
    const { updateActivity } = useAuthStore.getState();
    updateActivity();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { refreshToken, logout } = useAuthStore.getState();
    
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshed = await refreshToken();
      
      if (refreshed) {
        // Retry the original request
        return axios.request(error.config);
      } else {
        // Refresh failed, logout user
        logout();
        toast.error('Session expired. Please login again.');
      }
    }
    
    return Promise.reject(error);
  }
);

export { useAuthStore };