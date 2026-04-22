import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
  alpha
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F7F7F7' }}>
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          pb: { xs: 12, md: 4 },
          minHeight: '100vh'
        }}
      >
        <Outlet />
      </Box>

      {/* Premium Bottom Navigation for Mobile */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 400,
          display: { xs: 'block', md: 'none' },
          zIndex: 2000,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid #EEE',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            bgcolor: alpha('#FFF', 0.95),
            backdropFilter: 'blur(12px)',
          }}
        >
          <BottomNavigation
            value={getCurrentTab()}
            onChange={(event, newValue) => {
              switch (newValue) {
                case 0: navigate('/agent'); break;
                case 1: navigate('/agent/my-units'); break;
                case 2: navigate('/agent/inspections'); break;
                case 3: navigate('/agent/profile'); break;
                default: break;
              }
            }}
            sx={{
              height: 72,
              bgcolor: 'transparent',
              '& .MuiBottomNavigationAction-root': {
                color: '#888',
                '&.Mui-selected': {
                  color: '#667eea',
                  '& .MuiBottomNavigationAction-label': { fontWeight: 800, fontSize: '0.7rem' }
                }
              }
            }}
          >
            <BottomNavigationAction label="Overview" icon={<Dashboard />} />
            <BottomNavigationAction label="Inventory" icon={<Home />} />
            <BottomNavigationAction label="Inspections" icon={<Assignment />} />
            <BottomNavigationAction label="Profile" icon={<Person />} />
          </BottomNavigation>
        </Paper>
      </Box>

      {/* Floating Action Button for Desktop/Tablet */}
      {!isMobile && (
        <IconButton
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 56,
            height: 56,
            bgcolor: '#222',
            color: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            '&:hover': {
              bgcolor: '#444',
              transform: 'translateY(-4px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => navigate('/agent/add-unit')}
        >
          <Add sx={{ fontSize: 28 }} />
        </IconButton>
      )}
    </Box>
  );
};

export default AgentLayout;
