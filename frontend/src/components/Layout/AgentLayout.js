import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Dashboard,
  Home,
  Assignment,
  Person,
  Add
} from '@mui/icons-material';

const AgentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/agent' || path === '/agent/') return 0;
    if (path.includes('/agent/my-units')) return 1;
    if (path.includes('/agent/inspections')) return 2;
    if (path.includes('/agent/profile')) return 3;
    return 0;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Main Content Area - Full Screen */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 3 }, // More space at top without navbar
          pb: { xs: 10, md: 3 }, // Extra padding at bottom for mobile nav
          maxWidth: 1200,
          mx: 'auto',
          width: '100%'
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom Navigation for Mobile */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: 'block', md: 'none' },
          zIndex: 1000,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
        }}
        elevation={3}
      >
        <BottomNavigation
          value={getCurrentTab()}
          onChange={(event, newValue) => {
            switch (newValue) {
              case 0:
                navigate('/agent');
                break;
              case 1:
                navigate('/agent/my-units');
                break;
              case 2:
                navigate('/agent/inspections');
                break;
              case 3:
                navigate('/agent/profile');
                break;
              default:
                break;
            }
          }}
          showLabels
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px'
            },
            '& .Mui-selected': {
              color: 'primary.main',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 'bold'
              }
            }
          }}
        >
          <BottomNavigationAction
            label="Dashboard"
            icon={<Dashboard />}
          />
          <BottomNavigationAction
            label="My Units"
            icon={<Home />}
          />
          <BottomNavigationAction
            label="Inspections"
            icon={<Assignment />}
          />
          <BottomNavigationAction
            label="Profile"
            icon={<Person />}
          />
        </BottomNavigation>
      </Paper>

      {/* Floating Action Button for Desktop */}
      {!isMobile && (
        <IconButton
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            bgcolor: 'primary.main',
            color: 'white',
            boxShadow: 4,
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'scale(1.1)',
              boxShadow: 6
            },
            transition: 'all 0.2s'
          }}
          onClick={() => navigate('/agent/add-unit')}
        >
          <Add sx={{ fontSize: 32 }} />
        </IconButton>
      )}
    </Box>
  );
};

export default AgentLayout;

