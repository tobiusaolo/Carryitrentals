import React, { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Settings,
  Person,
  Refresh,
} from '@mui/icons-material';
import Sidebar, { drawerWidth } from './Sidebar';
import PortalNavTitle from './PortalNavTitle';
import { logout } from '../../store/slices/authSlice';
import { PageMetaProvider, usePageMeta } from '../../contexts/PageMetaContext';
import { OWNER_ROUTE_META, OWNER_PROPERTY_HUB_TAB_META, colors, layout } from '../../theme/designTokens';
import { triggerOwnerRefresh } from '../../utils/ownerRefresh';

const toolbarHeight = layout.headerHeight;

const OwnerLayoutChrome = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { meta } = usePageMeta();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleProfileMenuClose();
  };

  const handleSoftRefresh = async () => {
    setRefreshing(true);
    triggerOwnerRefresh();
    setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: colors.surfaceMuted, minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: alpha(colors.surface, 0.92),
          backdropFilter: 'blur(16px)',
          color: colors.text,
          borderBottom: `1px solid ${colors.border}`,
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            minHeight: toolbarHeight,
            py: 0.5,
            px: { xs: 2, md: 4 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { md: 'none' }, flexShrink: 0 }}
            >
              <MenuIcon />
            </IconButton>
            <PortalNavTitle
              title={meta?.title || 'Owner portal'}
              subtitle={meta?.subtitle}
              meta={meta?.meta}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <IconButton
              size="small"
              onClick={handleSoftRefresh}
              disabled={refreshing}
              aria-label="Refresh data"
              sx={{ display: { xs: 'inline-flex', md: 'inline-flex' } }}
            >
              <Refresh
                fontSize="small"
                sx={
                  refreshing
                    ? { animation: 'spin 0.8s linear infinite', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } }
                    : {}
                }
              />
            </IconButton>
            {!isMobile && (
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {user?.first_name} {user?.last_name}
              </Typography>
            )}

            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5, border: '1px solid #EEE' }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: colors.brand, fontWeight: 800, fontSize: '0.9rem' }}>
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            borderRadius: '16px',
            border: '1px solid #EEE',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            minWidth: 180,
            p: 1
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileMenuClose} sx={{ borderRadius: '8px', mb: 0.5 }}>
          <Person sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight={600}>Profile</Typography>
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose} sx={{ borderRadius: '8px', mb: 0.5 }}>
          <Settings sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" fontWeight={600}>Settings</Typography>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ borderRadius: '8px', color: '#ef4444' }}>
          <Logout sx={{ mr: 1.5, fontSize: 20 }} />
          <Typography variant="body2" fontWeight={700}>Logout</Typography>
        </MenuItem>
      </Menu>

      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: `${toolbarHeight}px`,
          minHeight: `calc(100vh - ${toolbarHeight}px)`,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

const Layout = () => {
  const location = useLocation();

  const fallback = useMemo(() => {
    if (location.pathname === '/owner/property-hub') {
      const tab = new URLSearchParams(location.search).get('tab') || 'properties';
      return OWNER_PROPERTY_HUB_TAB_META[tab] || OWNER_ROUTE_META['/owner/property-hub'];
    }
    return OWNER_ROUTE_META[location.pathname] || { title: 'Owner portal', subtitle: '' };
  }, [location.pathname, location.search]);

  return (
    <PageMetaProvider fallback={fallback}>
      <OwnerLayoutChrome />
    </PageMetaProvider>
  );
};

export default Layout;
