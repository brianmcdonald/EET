
import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import dtmLogo from '../assets/dtm-logo.svg';

const Header: React.FC = () => {
  return (
    <AppBar position="static" elevation={3}>
      <Toolbar sx={{ py: 2 }}>
        <Container maxWidth="lg">
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" justifyContent="center">
              <img
                src={dtmLogo}
                alt="DTM Data Kit Logo"
                style={{
                  height: '50px',
                  width: 'auto',
                  filter: 'brightness(0) invert(1)' // Makes the blue logo white
                }}
              />
            </Box>
            <Typography variant="h6" component="p" color="rgba(255,255,255,0.9)" fontWeight={400}>
              Emergency Event Tracking
            </Typography>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
