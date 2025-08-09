import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { LocalHospital as HealthIcon } from '@mui/icons-material';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        zIndex: 9999
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        {/* Logo/Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ marginBottom: 20 }}
        >
          <HealthIcon 
            sx={{ 
              fontSize: 60, 
              color: 'primary.main',
              filter: 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.3))'
            }} 
          />
        </motion.div>

        {/* App Name */}
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb, #10b981)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Arogya Card
        </Typography>

        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ mb: 4 }}
        >
          Digital Health Card System
        </Typography>

        {/* Loading Spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <CircularProgress 
            size={40} 
            thickness={4}
            sx={{ 
              color: 'primary.main',
              mb: 2
            }}
          />
        </motion.div>

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {message}
          </Typography>
        </motion.div>
      </motion.div>

      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.1,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #2563eb 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, #10b981 2px, transparent 2px)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 30px 30px',
          zIndex: -1
        }}
      />
    </Box>
  );
};

export default LoadingScreen;