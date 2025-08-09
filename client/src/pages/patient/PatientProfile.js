import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const PatientProfile = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Patient Profile</Typography>
        <Typography variant="body1">Coming Soon</Typography>
      </Paper>
    </Container>
  );
};

export default PatientProfile;