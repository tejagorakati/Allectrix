import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.firstName}!
        </Typography>
        <Typography variant="body1">
          Patient Dashboard - Coming Soon
        </Typography>
      </Paper>
    </Container>
  );
};

export default PatientDashboard;