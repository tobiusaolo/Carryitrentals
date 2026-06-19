import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
  Button,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import logoImage from '../../assets/images/er13.png';
import { colors, ownerPalette } from '../../theme/designTokens';
import { logout } from '../../store/slices/authSlice';
import {
  SpaceDashboard,
  Apartment,
  AccountBalanceWallet,
  Bolt,
  EventAvailable,
  ReceiptLong,
  Forum,
  Summarize,
  Insights,
  Logout,
  AdminPanelSettings,
  ChevronRight,
} from '@mui/icons-material';

export const drawerWidth = 272;

const navSections = [
  {
    label: 'Overview',
    items: [
      { text: 'Dashboard', icon: SpaceDashboard, path: '/owner/dashboard' },
    ],
  },
  {
    label: 'Portfolio',
    items: [
      {
        text: 'Property & listings',
        icon: Apartment,
        path: '/owner/property-hub',
        match: ['/owner/property-hub', '/owner/properties', '/owner/units', '/owner/tenants'],
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      { text: 'Rent payments', icon: AccountBalanceWallet, path: '/owner/payments' },
      { text: 'Billing & subscription', icon: ReceiptLong, path: '/owner/billing' },
      { text: 'Utilities', icon: Bolt, path: '/owner/utilities' },
      { text: 'Viewing payments', icon: ReceiptLong, path: '/owner/viewing-payments' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { text: 'Viewing bookings', icon: EventAvailable, path: '/owner/viewings' },
      { text: 'Communications', icon: Forum, path: '/owner/communications' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { text: 'Reports', icon: Summarize, path: '/owner/reports' },
      { text: 'Analytics', icon: Insights, path: '/owner/analytics' },
    ],
  },
];

const sidebarBg = '#141414';
const sidebarBorder = alpha('#FFFFFF', 0.08);
const sidebarText = alpha('#FFFFFF', 0.72);
const sidebarTextMuted = alpha('#FFFFFF', 0.42);

const isItemActive = (location, item) => {
  if (location.pathname === item.path) return true;
  if (item.match?.some((prefix) => location.pathname.startsWith(prefix))) return true;
  return false;
};

const Sidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) handleDrawerToggle();
  };

  const handleLogout = () => {
    dispatch(logout());
    if (isMobile) handleDrawerToggle();
  };

  const userInitials = `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || 'O'}`.toUpperCase();

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: sidebarBg,
        color: '#fff',
        backgroundImage: `linear-gradient(180deg, ${sidebarBg} 0%, #0d0d0d 100%)`,
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          px: 2.5,
          pt: 3,
          pb: 2.5,
          borderBottom: `1px solid ${sidebarBorder}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              p: 0.5,
              borderRadius: '14px',
              bgcolor: alpha('#fff', 0.06),
              border: `1px solid ${sidebarBorder}`,
              lineHeight: 0,
            }}
          >
            <Avatar
              src={logoImage}
              alt="CarryIT"
              sx={{ width: 36, height: 36, borderRadius: '10px' }}
              variant="rounded"
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '1.05rem',
                letterSpacing: '-0.03em',
                color: '#fff',
                lineHeight: 1.2,
              }}
            >
              CarryIT
            </Typography>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: sidebarTextMuted,
                mt: 0.25,
              }}
            >
              Owner portal
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Navigation */}
      <Box
        sx={{
          flex: 1,
          px: 1.5,
          py: 2,
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: 5 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: alpha('#fff', 0.12),
            borderRadius: 8,
          },
        }}
      >
        {navSections.map((section) => (
          <Box key={section.label} sx={{ mb: 2.5 }}>
            <Typography
              sx={{
                px: 1.5,
                mb: 0.75,
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: sidebarTextMuted,
              }}
            >
              {section.label}
            </Typography>
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.35 }}>
              {section.items.map((item) => {
                const active = isItemActive(location, item);
                const Icon = item.icon;
                return (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigate(item.path)}
                      sx={{
                        py: 1.1,
                        px: 1.5,
                        borderRadius: '10px',
                        position: 'relative',
                        overflow: 'hidden',
                        color: active ? '#fff' : sidebarText,
                        bgcolor: active ? alpha(ownerPalette.accent, 0.14) : 'transparent',
                        border: `1px solid ${active ? alpha(ownerPalette.accent, 0.35) : 'transparent'}`,
                        '&:hover': {
                          bgcolor: active
                            ? alpha(ownerPalette.accent, 0.18)
                            : alpha('#fff', 0.06),
                          color: '#fff',
                        },
                        transition: 'background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease',
                        '&::before': active
                          ? {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: '20%',
                              bottom: '20%',
                              width: 3,
                              borderRadius: '0 4px 4px 0',
                              bgcolor: ownerPalette.accent,
                            }
                          : {},
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: active ? ownerPalette.accent : sidebarTextMuted,
                        }}
                      >
                        <Icon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: active ? 700 : 500,
                          fontSize: '0.875rem',
                          letterSpacing: '-0.01em',
                          noWrap: true,
                        }}
                      />
                      {active && (
                        <ChevronRight
                          sx={{
                            fontSize: 16,
                            color: alpha(ownerPalette.accent, 0.9),
                            opacity: 0.9,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 1.5, borderTop: `1px solid ${sidebarBorder}` }}>
        {user?.role === 'admin' && (
          <Button
            fullWidth
            startIcon={<AdminPanelSettings sx={{ fontSize: 18 }} />}
            onClick={() => handleNavigate('/admin')}
            sx={{
              mb: 1.5,
              justifyContent: 'flex-start',
              color: '#fff',
              bgcolor: alpha('#fff', 0.06),
              border: `1px solid ${sidebarBorder}`,
              borderRadius: '10px',
              py: 1.1,
              px: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              '&:hover': { bgcolor: alpha('#fff', 0.1) },
            }}
          >
            Admin panel
          </Button>
        )}

        <Box
          sx={{
            p: 1.25,
            borderRadius: '12px',
            bgcolor: alpha('#fff', 0.04),
            border: `1px solid ${sidebarBorder}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: ownerPalette.accent,
                fontWeight: 800,
                fontSize: '0.8rem',
              }}
            >
              {userInitials}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                noWrap
                sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#fff', lineHeight: 1.3 }}
              >
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography noWrap sx={{ fontSize: '0.7rem', color: sidebarTextMuted }}>
                {user?.email || 'Property owner'}
              </Typography>
            </Box>
            <Tooltip title="Sign out">
              <IconButton
                size="small"
                onClick={handleLogout}
                sx={{
                  color: sidebarTextMuted,
                  '&:hover': { color: colors.error, bgcolor: alpha(colors.error, 0.12) },
                }}
              >
                <Logout sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: isMobile ? 'none' : '8px 0 32px rgba(0,0,0,0.18)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
