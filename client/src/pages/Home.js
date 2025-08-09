import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  useTheme,
  alpha
} from '@mui/material';
import {
  LocalHospital as HealthIcon,
  Security as SecurityIcon,
  QrCode as QrCodeIcon,
  Emergency as EmergencyIcon,
  CloudUpload as UploadIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <HealthIcon sx={{ fontSize: 40 }} />,
      title: 'Digital Health Card',
      description: 'Get your unique QR code-based health card for instant medical record access',
      action: 'Register Now',
      link: '/patient/register',
      color: theme.palette.primary.main
    },
    {
      icon: <QrCodeIcon sx={{ fontSize: 40 }} />,
      title: 'QR Code Access',
      description: 'Healthcare providers can scan your QR code for immediate access to medical history',
      action: 'Learn More',
      link: '/doctor/login',
      color: theme.palette.secondary.main
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure & Private',
      description: 'End-to-end encryption and blockchain logging ensure your data stays secure',
      action: 'Security Details',
      link: '#security',
      color: theme.palette.warning.main
    },
    {
      icon: <EmergencyIcon sx={{ fontSize: 40 }} />,
      title: 'Emergency Access',
      description: 'Biometric authentication allows emergency personnel quick access to critical info',
      action: 'Emergency Portal',
      link: '/emergency',
      color: theme.palette.error.main
    },
    {
      icon: <UploadIcon sx={{ fontSize: 40 }} />,
      title: 'Document Management',
      description: 'Upload and manage all your medical documents in one secure location',
      action: 'Upload Documents',
      link: '/patient/register',
      color: theme.palette.info.main
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Analytics & Insights',
      description: 'Track your health journey with comprehensive analytics and insights',
      action: 'View Analytics',
      link: '/patient/register',
      color: theme.palette.success.main
    }
  ];

  return (
    <>
      <Helmet>
        <title>Arogya Card - Digital Health Card Management System</title>
        <meta name="description" content="Secure, instant access to your medical records with QR code-based digital health cards" />
      </Helmet>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          py: { xs: 8, md: 12 },
          mb: 8
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <HealthIcon 
                sx={{ 
                  fontSize: 80,
                  color: 'primary.main',
                  mb: 3,
                  filter: 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.3))'
                }} 
              />
              
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  background: 'linear-gradient(135deg, #2563eb, #10b981)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Arogya Card
              </Typography>
              
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
              >
                Your Digital Health Card for Secure, Instant Access to Medical Records
              </Typography>
              
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 6, maxWidth: 800, mx: 'auto', lineHeight: 1.8 }}
              >
                Experience the future of healthcare with QR code-based digital health cards, 
                biometric authentication, and blockchain-secured medical records. 
                Join thousands who trust Arogya Card for their healthcare needs.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/patient/register"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    fontSize: '1.1rem',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
                    '&:hover': {
                      boxShadow: '0 12px 32px rgba(37, 99, 235, 0.4)'
                    }
                  }}
                >
                  Get Your Health Card
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/doctor/login"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                >
                  Healthcare Providers
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography
            variant="h3"
            component="h2"
            sx={{
              textAlign: 'center',
              mb: 2,
              fontWeight: 600
            }}
          >
            Powerful Features
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              mb: 6,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Comprehensive healthcare management tools designed for patients, 
            healthcare providers, and emergency personnel.
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          p: 2,
                          borderRadius: '50%',
                          bgcolor: alpha(feature.color, 0.1),
                          color: feature.color,
                          mb: 2
                        }}
                      >
                        {feature.icon}
                      </Box>
                      
                      <Typography variant="h6" component="h3" gutterBottom>
                        {feature.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                      <Button
                        size="small"
                        component={Link}
                        to={feature.link}
                        sx={{ color: feature.color }}
                      >
                        {feature.action}
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              Ready to Get Started?
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              Join the digital healthcare revolution today. Create your health card 
              in minutes and experience seamless medical record management.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/patient/register"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100'
                  }
                }}
              >
                Create Health Card
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/emergency"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white'
                  }
                }}
              >
                Emergency Access
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </>
  );
};

export default Home;