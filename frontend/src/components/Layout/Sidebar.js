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
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import {
  Dashboard,
  Home,
  Apartment,
  Assignment,
  Payment,
  Build,
  Analytics,
  CalendarToday,
  Person,
  ElectricalServices,
  QrCode,
  Settings,
  Message,
  AccountBalance,
  Description,
  Bed as AirbnbIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/owner/dashboard' },
  { text: 'Properties', icon: <Home />, path: '/owner/properties' },
  { text: 'Units', icon: <Apartment />, path: '/owner/units' },
  { text: 'Units for Rent', icon: <QrCode />, path: '/owner/units-for-rent' },
  { text: 'Airbnb', icon: <AirbnbIcon />, path: '/owner/airbnb' },
  { text: 'Tenants', icon: <Person />, path: '/owner/tenants' },
  { text: 'Payments', icon: <Payment />, path: '/owner/payments' },
  { text: 'Property QR', icon: <QrCode />, path: '/owner/property-qr' },
  { text: 'Utilities', icon: <ElectricalServices />, path: '/owner/utilities' },
  { text: 'Inspections', icon: <CalendarToday />, path: '/owner/inspections' },
  { text: 'Communications', icon: <Message />, path: '/owner/communications' },
  { text: 'Reports', icon: <Description />, path: '/owner/reports' },
  { text: 'Analytics', icon: <Analytics />, path: '/owner/analytics' },
];

    const adminMenuItems = [
      { text: 'Admin Dashboard', icon: <Settings />, path: '/admin' },
      { text: 'Admin Properties', icon: <Home />, path: '/admin/properties' },
      { text: 'Admin Analytics', icon: <Analytics />, path: '/admin/analytics' },
    ];

const Sidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const drawer = (
    <Box>
      {/* Logo/Brand */}
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={logoImage}
            alt="Easy Rentals Logo"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              mb: 1
            }}
            variant="rounded"
          />
          <Typography variant="h6" color="primary" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
            Easy Rentals
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Professional Property Management
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* User Info */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person color="primary" />
          <Box>
            <Typography variant="subtitle2" fontWeight="medium">
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Navigation Menu */}
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    handleDrawerToggle();
                  }
                }}
                sx={{
                  backgroundColor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.light' : 'action.hover',
                  },
                  mx: 1,
                  borderRadius: 1,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        
        {/* Admin Menu Items */}
        {user?.role === 'admin' && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="overline" color="text.secondary">
                Admin Panel
              </Typography>
            </Box>
            {adminMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) {
                        handleDrawerToggle();
                      }
                    }}
                    sx={{
                      backgroundColor: isActive ? 'primary.light' : 'transparent',
                      color: isActive ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        backgroundColor: isActive ? 'primary.light' : 'action.hover',
                      },
                      mx: 1,
                      borderRadius: 1,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? 'primary.contrastText' : 'text.secondary',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;

