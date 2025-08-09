import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const HealthCard = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Health Card</Typography>
      <Typography variant="body1">Coming Soon</Typography>
    </Paper>
  </Container>
);

export default HealthCard;