import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Avatar,
  LinearProgress,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Home,
  AttachMoney,
  Refresh,
  Schedule,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import { useCachedQueries } from '../../hooks/useCachedQuery';
import EnhancedStatCard from '../../components/UI/EnhancedStatCard';
import PageHeader from '../../components/UI/PageHeader';
import { colors } from '../../theme/designTokens';

const ModernAdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const portalEnabled = user?.role === 'admin';

  const {
    data,
    loading,
    refreshing,
    error,
    refresh: loadDashboardData,
  } = useCachedQueries(
    [
      { url: '/admin/stats' },
      {
        url: '/admin/recent-activity?limit=6',
        select: (payload) => (Array.isArray(payload) ? payload : []),
      },
      {
        url: '/admin/system-alerts',
        select: (payload) => (Array.isArray(payload) ? payload : []),
      },
    ],
    { enabled: portalEnabled, deps: [user?.id] }
  );

  const stats = data?.[0];
  const recentActivity = Array.isArray(data?.[1]) ? data[1] : [];
  const systemAlerts = Array.isArray(data?.[2]) ? data[2] : [];

  useEffect(() => {
    if (portalEnabled) {
      dispatch(fetchProperties());
    }
  }, [dispatch, portalEnabled]);

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) {
    return <Alert severity="info">No data yet.</Alert>;
  }

  return (
    <Box>
      <PageHeader
        variant="admin"
        title="Dashboard"
        action={
          <IconButton onClick={loadDashboardData} disabled={refreshing} size="small" sx={{ border: `1px solid ${colors.border}` }}>
            <Refresh fontSize="small" />
          </IconButton>
        }
      />

      {systemAlerts.map((alert) => (
        <Alert key={alert.id} severity={alert.type === 'error' ? 'error' : 'warning'} sx={{ mb: 2, borderRadius: `${12}px` }}>
          <strong>{alert.title}</strong> — {alert.message}
        </Alert>
      ))}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <EnhancedStatCard title="Properties" value={stats.overview.total_properties} icon={<Home />} color={colors.adminAccent} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <EnhancedStatCard title="Tenants" value={stats.overview.total_tenants} icon={<People />} color={colors.success} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <EnhancedStatCard
            title="Monthly revenue"
            value={`$${stats.revenue.total_monthly_revenue.toLocaleString()}`}
            icon={<AttachMoney />}
            color={colors.warning}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <EnhancedStatCard
            title="Occupancy"
            value={`${stats.occupancy.occupancy_rate}%`}
            icon={<TrendingUp />}
            color="#8b5cf6"
            progress={stats.occupancy.occupancy_rate}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: `${16}px`, border: `1px solid ${colors.border}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Recent activity
            </Typography>
            <List disablePadding>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: colors.surfaceMuted, color: colors.text }}>
                        <Schedule sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.message}
                      secondary={new Date(activity.timestamp).toLocaleString()}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: `${16}px`, border: `1px solid ${colors.border}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              System health
            </Typography>
            {[
              { label: 'Uptime', value: stats.system.uptime, color: colors.success },
              { label: 'Response', value: stats.system.response_time, suffix: 'ms', color: '#667eea', bar: Math.max(0, 100 - stats.system.response_time / 10) },
              { label: 'Errors', value: stats.system.error_rate, suffix: '%', color: colors.error, bar: stats.system.error_rate * 10 },
            ].map((row) => (
              <Box key={row.label} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: row.color }}>
                    {row.value}{row.suffix || '%'}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={row.bar ?? row.value}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: colors.surfaceMuted,
                    '& .MuiLinearProgress-bar': { bgcolor: row.color },
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModernAdminDashboard;
