import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Settings,
  Notifications as NotificationsIcon,
  Person,
  Refresh,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import AdminSidebar from './AdminSidebar';
import PortalNavTitle from './PortalNavTitle';
import authService from '../../services/authService';
import { PageMetaProvider, usePageMeta } from '../../contexts/PageMetaContext';
import { ADMIN_ROUTE_META, colors, layout } from '../../theme/designTokens';
import { triggerAdminRefresh } from '../../utils/adminRefresh';
import useAdminNavBadges from '../../hooks/useAdminNavBadges';

const drawerWidth = layout.adminSidebarWidth;
const toolbarHeight = 64;

const AdminLayoutChrome = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { meta } = usePageMeta();
  const { refresh: refreshBadges } = useAdminNavBadges(Boolean(user));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadUnreadCount = async () => {
    try {
      const api = authService.createAxiosInstance();
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data?.unread_count || 0);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleSoftRefresh = async () => {
    setRefreshing(true);
    triggerAdminRefresh();
    await Promise.all([loadUnreadCount(), refreshBadges()]);
    setTimeout(() => setRefreshing(false), 400);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.surfaceMuted }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: colors.surface,
          color: colors.text,
          borderBottom: `1px solid ${colors.border}`,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            minHeight: toolbarHeight,
            py: 0.5,
            px: { xs: 2, md: 3 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ display: { md: 'none' }, flexShrink: 0 }}>
              <MenuIcon />
            </IconButton>
            <PortalNavTitle
              title={meta?.title || 'Admin'}
              subtitle={meta?.subtitle}
              meta={meta?.meta}
              pathname={location.pathname.startsWith('/admin') ? location.pathname : null}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <IconButton
              size="small"
              onClick={handleSoftRefresh}
              disabled={refreshing}
              aria-label="Refresh data"
            >
              <Refresh fontSize="small" sx={refreshing ? { animation: 'spin 0.8s linear infinite', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } } : {}} />
            </IconButton>
            <IconButton size="small" onClick={() => navigate('/admin/notifications')}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: colors.adminAccent, fontSize: '0.8rem', fontWeight: 700 }}>
                {user?.first_name?.charAt(0) || 'A'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <AdminSidebar mobileOpen={mobileOpen} handleDrawerToggle={() => setMobileOpen(!mobileOpen)} isMobile={isMobile} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: `${toolbarHeight}px`,
          minHeight: `calc(100vh - ${toolbarHeight}px)`,
        }}
      >
        <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, py: { xs: 2, md: 2.5 }, maxWidth: layout.adminMaxWidth, mx: 'auto', width: '100%', minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: `${layout.radius.md}px`, minWidth: 180, mt: 1 } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{user?.first_name} {user?.last_name}</Typography>
          <Typography variant="caption" color="text.secondary">Administrator</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin/settings'); }}>
          <Settings sx={{ mr: 1, fontSize: 18 }} /> Settings
        </MenuItem>
        <MenuItem onClick={() => { dispatch(logout()); setAnchorEl(null); }} sx={{ color: colors.error }}>
          <Logout sx={{ mr: 1, fontSize: 18 }} /> Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
};

const AdminLayout = () => {
  const location = useLocation();

  const fallback = useMemo(
    () => ADMIN_ROUTE_META[location.pathname] || { title: 'Admin', subtitle: '' },
    [location.pathname]
  );

  return (
    <PageMetaProvider fallback={fallback}>
      <AdminLayoutChrome />
    </PageMetaProvider>
  );
};

export default AdminLayout;
