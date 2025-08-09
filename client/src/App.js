import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

// Import components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingScreen from './components/common/LoadingScreen';

// Import pages
import Home from './pages/Home';
import PatientRegister from './pages/patient/PatientRegister';
import PatientLogin from './pages/patient/PatientLogin';
import PatientDashboard from './pages/patient/PatientDashboard';
import HealthCard from './pages/patient/HealthCard';
import MedicalRecords from './pages/patient/MedicalRecords';
import DocumentUpload from './pages/patient/DocumentUpload';
import ProfileSettings from './pages/patient/ProfileSettings';

import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorRegister from './pages/doctor/DoctorRegister';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientSearch from './pages/doctor/PatientSearch';
import QRScanner from './pages/doctor/QRScanner';
import CreateRecord from './pages/doctor/CreateRecord';

import EmergencyAccess from './pages/emergency/EmergencyAccess';
import BiometricAuth from './pages/emergency/BiometricAuth';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemAnalytics from './pages/admin/SystemAnalytics';

// Import context/store
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Modern blue
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981', // Emerald green
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { isLoading, isAuthenticated, user } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              
              <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  
                  {/* Patient Routes */}
                  <Route 
                    path="/patient/register" 
                    element={
                      !isAuthenticated ? <PatientRegister /> : <Navigate to="/patient/dashboard" />
                    } 
                  />
                  <Route 
                    path="/patient/login" 
                    element={
                      !isAuthenticated ? <PatientLogin /> : <Navigate to="/patient/dashboard" />
                    } 
                  />
                  
                  {/* Protected Patient Routes */}
                  <Route 
                    path="/patient/dashboard" 
                    element={
                      <ProtectedRoute userType="Patient">
                        <PatientDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/patient/health-card" 
                    element={
                      <ProtectedRoute userType="Patient">
                        <HealthCard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/patient/medical-records" 
                    element={
                      <ProtectedRoute userType="Patient">
                        <MedicalRecords />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/patient/upload-documents" 
                    element={
                      <ProtectedRoute userType="Patient">
                        <DocumentUpload />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/patient/settings" 
                    element={
                      <ProtectedRoute userType="Patient">
                        <ProfileSettings />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Doctor Routes */}
                  <Route 
                    path="/doctor/login" 
                    element={
                      !isAuthenticated ? <DoctorLogin /> : <Navigate to="/doctor/dashboard" />
                    } 
                  />
                  <Route 
                    path="/doctor/register" 
                    element={
                      !isAuthenticated ? <DoctorRegister /> : <Navigate to="/doctor/dashboard" />
                    } 
                  />
                  
                  {/* Protected Doctor Routes */}
                  <Route 
                    path="/doctor/dashboard" 
                    element={
                      <ProtectedRoute userType="Doctor">
                        <DoctorDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/doctor/patient-search" 
                    element={
                      <ProtectedRoute userType="Doctor">
                        <PatientSearch />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/doctor/qr-scanner" 
                    element={
                      <ProtectedRoute userType="Doctor">
                        <QRScanner />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/doctor/create-record/:patientId" 
                    element={
                      <ProtectedRoute userType="Doctor">
                        <CreateRecord />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Emergency Access Routes */}
                  <Route path="/emergency" element={<EmergencyAccess />} />
                  <Route path="/emergency/biometric" element={<BiometricAuth />} />

                  {/* Admin Routes */}
                  <Route 
                    path="/admin/login" 
                    element={
                      !isAuthenticated ? <AdminLogin /> : <Navigate to="/admin/dashboard" />
                    } 
                  />
                  
                  {/* Protected Admin Routes */}
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <ProtectedRoute userType="Admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <ProtectedRoute userType="Admin">
                        <UserManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/analytics" 
                    element={
                      <ProtectedRoute userType="Admin">
                        <SystemAnalytics />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Catch all - 404 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>

              <Footer />
            </Box>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '8px',
                },
                success: {
                  style: {
                    background: theme.palette.success.main,
                  },
                },
                error: {
                  style: {
                    background: theme.palette.error.main,
                  },
                },
              }}
            />
          </Router>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;