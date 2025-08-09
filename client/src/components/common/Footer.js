import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2024 Arogya Card. Built with ❤️ for better healthcare accessibility.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Secure • Accessible • Reliable
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;