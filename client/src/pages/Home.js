import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Avatar,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  LocalHospital,
  QrCode,
  Security,
  CloudSync,
  Verified,
  Emergency,
  AdminPanelSettings,
  MedicalServices,
  Person,
  ArrowForward
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <QrCode sx={{ fontSize: 40 }} />,
      title: 'Digital Health Cards',
      description: 'Secure QR code-based health cards for instant access to medical information.',
      color: 'primary.main'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Blockchain Security',
      description: 'Immutable medical records with blockchain-backed audit trails.',
      color: 'success.main'
    },
    {
      icon: <Emergency sx={{ fontSize: 40 }} />,
      title: 'Emergency Access',
      description: 'Biometric-enabled emergency access for critical medical situations.',
      color: 'error.main'
    },
    {
      icon: <CloudSync sx={{ fontSize: 40 }} />,
      title: 'Real-time Sync',
      description: 'Instant notifications and updates across all authorized devices.',
      color: 'info.main'
    }
  ];

  const userTypes = [
    {
      type: 'patient',
      title: 'For Patients',
      description: 'Register and get your digital health card. Manage your medical records securely.',
      icon: <Person sx={{ fontSize: 60 }} />,
      features: [
        'Digital Health Card with QR Code',
        'Secure Medical Record Storage',
        'Emergency Contact Management',
        'Privacy Control Settings',
        'Real-time Notifications'
      ],
      primaryAction: 'Register Now',
      secondaryAction: 'Patient Login',
      primaryLink: '/patient/register',
      secondaryLink: '/patient/login',
      color: 'primary'
    },
    {
      type: 'doctor',
      title: 'For Doctors',
      description: 'Access patient records securely with QR code scanning and two-factor authentication.',
      icon: <MedicalServices sx={{ fontSize: 60 }} />,
      features: [
        'QR Code Scanner for Patient Access',
        'Secure Record Management',
        'Digital Prescription System',
        'Audit Trail Visibility',
        'Two-Factor Authentication'
      ],
      primaryAction: 'Register as Doctor',
      secondaryAction: 'Doctor Login',
      primaryLink: '/doctor/register',
      secondaryLink: '/doctor/login',
      color: 'secondary'
    },
    {
      type: 'admin',
      title: 'For Administrators',
      description: 'Manage users, verify doctors, and monitor system health with comprehensive analytics.',
      icon: <AdminPanelSettings sx={{ fontSize: 60 }} />,
      features: [
        'User Management Dashboard',
        'Doctor Verification System',
        'System Analytics & Reports',
        'Card Management Tools',
        'Security Monitoring'
      ],
      primaryAction: 'Admin Login',
      secondaryAction: null,
      primaryLink: '/admin/login',
      secondaryLink: null,
      color: 'warning'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Arogya Card
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom sx={{ opacity: 0.9 }}>
                Digital Healthcare Revolution
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', opacity: 0.8 }}>
                Secure, blockchain-powered digital health cards with QR code access, 
                emergency biometric authentication, and real-time medical record management.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  component={RouterLink}
                  to="/patient/register"
                  endIcon={<ArrowForward />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Get Your Health Card
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  onClick={() => navigate('/emergency')}
                >
                  Emergency Access
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 300
                }}
              >
                <Avatar
                  sx={{
                    width: 200,
                    height: 200,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    border: '4px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <LocalHospital sx={{ fontSize: 100 }} />
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Key Features
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Advanced healthcare technology for better patient care
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: feature.color,
                    mb: 2
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* User Types Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Choose Your Role
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Different interfaces for different needs
          </Typography>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            {userTypes.map((userType, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.3s ease'
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -30,
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: `${userType.color}.main`,
                        border: '4px solid white',
                        boxShadow: 2
                      }}
                    >
                      {userType.icon}
                    </Avatar>
                  </Box>
                  
                  <CardContent sx={{ pt: 6, pb: 2, flexGrow: 1 }}>
                    <Typography variant="h5" component="h3" align="center" gutterBottom>
                      {userType.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" paragraph>
                      {userType.description}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Stack spacing={1}>
                      {userType.features.map((feature, featureIndex) => (
                        <Box key={featureIndex} display="flex" alignItems="center" gap={1}>
                          <Verified sx={{ fontSize: 16, color: `${userType.color}.main` }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                  
                  <CardActions sx={{ p: 3, pt: 0, flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="contained"
                      color={userType.color}
                      fullWidth
                      size="large"
                      component={RouterLink}
                      to={userType.primaryLink}
                    >
                      {userType.primaryAction}
                    </Button>
                    {userType.secondaryAction && (
                      <Button
                        variant="outlined"
                        color={userType.color}
                        fullWidth
                        component={RouterLink}
                        to={userType.secondaryLink}
                      >
                        {userType.secondaryAction}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Emergency Access Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Emergency sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" component="h2" gutterBottom>
            Emergency Access
          </Typography>
          <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
            In case of medical emergency, access critical patient information instantly
          </Typography>
          <Typography variant="body1" paragraph sx={{ opacity: 0.8 }}>
            Our biometric emergency access system allows verified medical personnel 
            to access essential patient information even without the patient's health card.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'error.main',
              mt: 2,
              px: 4,
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
            component={RouterLink}
            to="/emergency"
          >
            Access Emergency Portal
          </Button>
        </Paper>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'background.default', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                100K+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Registered Patients
              </Typography>
            </Grid>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                5K+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Verified Doctors
              </Typography>
            </Grid>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                1M+
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Secure Records
              </Typography>
            </Grid>
            <Grid item xs={6} md={3} textAlign="center">
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                99.9%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Uptime
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;