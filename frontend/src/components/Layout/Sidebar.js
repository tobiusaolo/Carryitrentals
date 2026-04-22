import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  alpha,
  Button
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import {
  Dashboard,
  Home,
  Apartment,
  Payment,
  Analytics,
  CalendarToday,
  Person,
  ElectricalServices,
  QrCode,
  Message,
  Description,
  Bed as AirbnbIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/owner/dashboard' },
  { text: 'Properties', icon: <Home />, path: '/owner/properties' },
  { text: 'Units', icon: <Apartment />, path: '/owner/units' },
  { text: 'Units for Rent', icon: <QrCode />, path: '/owner/units-for-rent' },
  { text: 'Airbnb', icon: <AirbnbIcon />, path: '/owner/airbnb' },
  { text: 'Tenants', icon: <Person />, path: '/owner/tenants' },
  { text: 'Payments', icon: <Payment />, path: '/owner/payments' },
  { text: 'Utilities', icon: <ElectricalServices />, path: '/owner/utilities' },
  { text: 'Inspections', icon: <CalendarToday />, path: '/owner/inspections' },
  { text: 'Communications', icon: <Message />, path: '/owner/communications' },
  { text: 'Reports', icon: <Description />, path: '/owner/reports' },
  { text: 'Analytics', icon: <Analytics />, path: '/owner/analytics' },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
      {/* Brand Header */}
      <Box sx={{ px: 4, py: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={logoImage}
          alt="CarryIT"
          sx={{ width: 40, height: 40, borderRadius: '10px' }}
          variant="rounded"
        />
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#222', letterSpacing: '-0.03em' }}>
          CarryIT
        </Typography>
      </Box>
      
      {/* Navigation */}
      <Box sx={{ flex: 1, px: 2, pb: 4, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#EEE', borderRadius: '4px' } }}>
        <List sx={{ gap: 0.5, display: 'flex', flexDirection: 'column' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) handleDrawerToggle();
                  }}
                  sx={{
                    py: 1.2,
                    px: 2,
                    borderRadius: '12px',
                    bgcolor: isActive ? alpha('#667eea', 0.08) : 'transparent',
                    color: isActive ? '#667eea' : '#555',
                    '&:hover': {
                      bgcolor: isActive ? alpha('#667eea', 0.12) : '#F7F7F7',
                      color: isActive ? '#667eea' : '#222',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#667eea' : '#888',
                      minWidth: 36,
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { fontSize: 22 } })}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.9rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Admin Quick Switch (If applicable) */}
      {user?.role === 'admin' && (
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/admin')}
            sx={{
              bgcolor: '#222', color: 'white', py: 1.5, borderRadius: '12px', textTransform: 'none', fontWeight: 800,
              '&:hover': { bgcolor: '#444' }
            }}
          >
            Admin Panel
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid #EEE',
            boxShadow: isMobile ? 'none' : '4px 0 24px rgba(0,0,0,0.02)'
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
