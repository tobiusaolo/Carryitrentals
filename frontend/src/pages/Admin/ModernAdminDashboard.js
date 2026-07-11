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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Home,
  AttachMoney,
  Refresh,
  Schedule,
  Assignment,
  Business,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import { useCachedQueries } from '../../hooks/useCachedQuery';
import PageHeader from '../../components/UI/PageHeader';
import AdminPage from '../../components/Admin/AdminPage';
import AdminStatStrip from '../../components/Admin/AdminStatStrip';
import AdminPanel from '../../components/Admin/AdminPanel';
import { colors, adminPalette } from '../../theme/designTokens';
import { formatMoney } from '../../utils/formatMoney';
import useAdminNavBadges from '../../hooks/useAdminNavBadges';

const ModernAdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const { badges } = useAdminNavBadges(portalEnabled);

  useEffect(() => {
    if (portalEnabled) {
      dispatch(fetchProperties());
    }
  }, [dispatch, portalEnabled]);

  if (loading && !stats) {
    return (
      <AdminPage>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      </AdminPage>
    );
  }

  if (error) {
    return (
      <AdminPage>
        <Alert severity="error">{error}</Alert>
      </AdminPage>
    );
  }

  if (!stats) {
    return (
      <AdminPage>
        <Alert severity="info">No data yet.</Alert>
      </AdminPage>
    );
  }

  const pendingInspections = stats.maintenance?.pending_inspections ?? 0;
  const pendingPayments = stats.revenue?.pending_payments ?? 0;
  const overduePayments = stats.revenue?.overdue_payments ?? 0;
  const occupiedInternal = stats.occupancy?.occupied_units ?? 0;
  const occupiedRental = stats.occupancy?.occupied_rental_units ?? 0;

  const actionItems = [
    badges.listingRequests > 0 && {
      label: `${badges.listingRequests} listing request${badges.listingRequests === 1 ? '' : 's'} pending review`,
      path: '/admin/listing-requests',
    },
    badges.listingReports > 0 && {
      label: `${badges.listingReports} listing report${badges.listingReports === 1 ? '' : 's'} to review`,
      path: '/admin/listing-reports',
    },
    pendingInspections > 0 && {
      label: `${pendingInspections} inspection${pendingInspections === 1 ? '' : 's'} awaiting review`,
      path: '/admin/inspections',
    },
    badges.paymentIntents > 0 && {
      label: `${badges.paymentIntents} payment proof${badges.paymentIntents === 1 ? '' : 's'} awaiting approval`,
      path: '/admin/payment-intents',
    },
    badges.maintenance > 0 && {
      label: `${badges.maintenance} open maintenance request${badges.maintenance === 1 ? '' : 's'}`,
      path: '/admin/maintenance',
    },
    overduePayments > 0 && {
      label: `${overduePayments} overdue rent payment${overduePayments === 1 ? '' : 's'}`,
      path: '/admin/tenants',
    },
  ].filter(Boolean);

  return (
    <AdminPage>
      <PageHeader
        variant="admin"
        title="Dashboard"
        subtitle="Platform overview"
        action={
          <IconButton
            onClick={loadDashboardData}
            disabled={refreshing}
            size="small"
            sx={{ border: `1px solid ${colors.border}` }}
          >
            <Refresh fontSize="small" />
          </IconButton>
        }
      />

      {systemAlerts.map((alert) => (
        <Alert
          key={alert.id}
          severity={alert.type === 'error' ? 'error' : 'warning'}
          sx={{ mb: 2, borderRadius: `${12}px` }}
        >
          <strong>{alert.title}</strong> — {alert.message}
        </Alert>
      ))}

      {actionItems.length > 0 && (
        <AdminPanel
          title="Needs attention"
          subtitle="Items that may need admin action"
          sx={{ mb: 2.5 }}
          contentSx={{ py: 1.5, px: 2 }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {actionItems.map((item) => (
              <Button
                key={item.path}
                size="small"
                variant="outlined"
                startIcon={<Assignment fontSize="small" />}
                onClick={() => navigate(item.path)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </AdminPanel>
      )}

      {actionItems.length === 0 &&
        badges.listingRequests === 0 &&
        badges.paymentIntents === 0 &&
        badges.listingReports === 0 &&
        badges.maintenance === 0 && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: `${12}px` }}>
          All clear — no pending actions right now.
        </Alert>
      )}

      <AdminStatStrip
        stats={[
          {
            id: 'properties',
            title: 'Properties',
            value: stats.overview.total_properties,
            icon: <Home />,
            onClick: () => navigate('/admin/properties'),
          },
          {
            id: 'owners',
            title: 'Owners',
            value: stats.overview.total_owners,
            icon: <Business />,
            onClick: () => navigate('/admin/owners'),
          },
          {
            id: 'tenants',
            title: 'Tenants',
            value: stats.overview.total_tenants,
            icon: <People />,
            onClick: () => navigate('/admin/tenants'),
          },
          {
            id: 'revenue',
            title: 'Monthly revenue',
            value: formatMoney(stats.revenue.total_monthly_revenue, 'UGX'),
            subtitle: `${stats.revenue.payments_this_month} payments this month`,
            icon: <AttachMoney />,
            onClick: () => navigate('/admin/revenue'),
          },
          {
            id: 'occupancy',
            title: 'Occupancy',
            value: `${stats.occupancy.occupancy_rate}%`,
            subtitle: `${occupiedInternal} internal · ${occupiedRental} rental (${stats.occupancy.total_occupied}/${stats.occupancy.total_all_units})`,
            icon: <TrendingUp />,
            progress: stats.occupancy.occupancy_rate,
          },
        ]}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <AdminPanel title="Recent activity">
            <List disablePadding>
              {recentActivity.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No recent activity.
                </Typography>
              )}
              {recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: colors.surfaceMuted,
                          color: colors.text,
                        }}
                      >
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
          </AdminPanel>
        </Grid>

        <Grid item xs={12} md={6}>
          <AdminPanel title="System health">
            {[
              {
                label: 'Active users',
                value: stats.system?.active_users ?? 0,
                color: colors.success,
                bar: Math.min(100, (stats.system?.active_users ?? 0) * 5),
              },
              {
                label: 'Pending payments',
                value: pendingPayments,
                color: adminPalette.indigo,
                bar: Math.min(100, pendingPayments * 10),
              },
              {
                label: 'Overdue rent',
                value: overduePayments,
                color: colors.error,
                bar: Math.min(100, overduePayments * 10),
              },
              {
                label: 'Pending inspections',
                value: pendingInspections,
                color: colors.warning,
                bar: Math.min(100, pendingInspections * 10),
              },
            ].map((row) => (
              <Box key={row.label} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {row.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: row.color }}>
                    {row.value}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={row.bar}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: colors.surfaceMuted,
                    '& .MuiLinearProgress-bar': { bgcolor: row.color },
                  }}
                />
              </Box>
            ))}
          </AdminPanel>
        </Grid>
      </Grid>
    </AdminPage>
  );
};

export default ModernAdminDashboard;
