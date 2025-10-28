import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
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
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import adminAPI from '../../services/api/adminAPI';

const ModernAdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { properties } = useSelector(state => state.properties);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load properties for additional context
      await dispatch(fetchProperties());
      
      // Load admin statistics
      const [statsData, activityData, alertsData] = await Promise.all([
        adminAPI.getAdminStats(),
        adminAPI.getRecentActivity(8),
        adminAPI.getSystemAlerts()
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
      setSystemAlerts(alertsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend, trendValue }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${alpha(color, 0.3)}`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend === 'up' ? (
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
              ) : (
                <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
              )}
              <Typography variant="caption" color={trend === 'up' ? 'success.main' : 'error.main'}>
                {trendValue}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
          {value}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'tenant': return <PersonIcon color="primary" />;
        case 'property': return <HomeIcon color="success" />;
        case 'rental_unit': return <ApartmentIcon color="info" />;
        case 'payment': return <MoneyIcon color="success" />;
        case 'maintenance': return <BuildIcon color="warning" />;
        default: return <NotificationsIcon color="default" />;
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'tenant': return 'primary';
        case 'property': return 'success';
        case 'rental_unit': return 'info';
        case 'payment': return 'success';
        case 'maintenance': return 'warning';
        default: return 'default';
      }
    };

    return (
      <ListItem sx={{ px: 0 }}>
        <ListItemIcon sx={{ minWidth: 40 }}>
          {getActivityIcon(activity.type)}
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body2" color="text.primary">
              {activity.message}
            </Typography>
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {new Date(activity.timestamp).toLocaleString()}
              </Typography>
              {activity.amount && (
                <Chip 
                  label={`$${activity.amount}`} 
                  size="small" 
                  color="success" 
                  variant="outlined"
                />
              )}
            </Box>
          }
        />
      </ListItem>
    );
  };

  const AlertItem = ({ alert }) => {
    const getAlertIcon = (type) => {
      switch (type) {
        case 'warning': return <WarningIcon color="warning" />;
        case 'error': return <WarningIcon color="error" />;
        case 'info': return <NotificationsIcon color="info" />;
        default: return <CheckCircleIcon color="success" />;
      }
    };

    const getAlertColor = (type) => {
      switch (type) {
        case 'warning': return 'warning';
        case 'error': return 'error';
        case 'info': return 'info';
        default: return 'success';
      }
    };

    return (
      <Alert 
        severity={getAlertColor(alert.type)} 
        icon={getAlertIcon(alert.type)}
        sx={{ mb: 1 }}
      >
        <Typography variant="body2" fontWeight="medium">
          {alert.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {alert.message}
        </Typography>
      </Alert>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={handleRefresh} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert severity="info">
        No data available. Please try refreshing the page.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.first_name}! Here's your system overview.
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            System Alerts
          </Typography>
          {systemAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </Box>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Properties"
            value={stats.overview.total_properties}
            icon={<HomeIcon />}
            color={theme.palette.primary.main}
            subtitle="Active properties"
            trend="up"
            trendValue="5.2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Units"
            value={stats.overview.total_units + stats.overview.total_rental_units}
            icon={<ApartmentIcon />}
            color={theme.palette.success.main}
            subtitle="All unit types"
            trend="up"
            trendValue="3.1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tenants"
            value={stats.overview.total_tenants}
            icon={<PeopleIcon />}
            color={theme.palette.info.main}
            subtitle="Active tenants"
            trend="up"
            trendValue="8.7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.revenue.total_monthly_revenue.toLocaleString()}`}
            icon={<MoneyIcon />}
            color={theme.palette.warning.main}
            subtitle="Expected monthly income"
            trend="up"
            trendValue="12.3"
          />
        </Grid>
      </Grid>

      {/* Secondary Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Occupancy Rate"
            value={`${stats.occupancy.occupancy_rate}%`}
            icon={<TrendingUpIcon />}
            color={theme.palette.success.main}
            subtitle={`${stats.occupancy.total_occupied} of ${stats.occupancy.total_all_units} units`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Property Owners"
            value={stats.overview.total_owners}
            icon={<BusinessIcon />}
            color={theme.palette.primary.main}
            subtitle="Registered owners"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Agents"
            value={stats.overview.total_agents}
            icon={<PersonIcon />}
            color={theme.palette.info.main}
            subtitle="Available agents"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Payments"
            value={stats.revenue.pending_payments}
            icon={<ScheduleIcon />}
            color={theme.palette.warning.main}
            subtitle={`${stats.revenue.overdue_payments} overdue`}
          />
        </Grid>
      </Grid>

      {/* Charts and Activity */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ActivityItem activity={activity} />
                      {index < recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No recent activity
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                System Health
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">System Uptime</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.system.uptime}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.system.uptime} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Response Time</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.system.response_time}ms
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.max(0, 100 - (stats.system.response_time / 10))} 
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Error Rate</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.system.error_rate}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.system.error_rate * 10} 
                  color="error"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {stats.maintenance.active_requests}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active Maintenance
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="info">
                      {stats.maintenance.pending_inspections}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pending Inspections
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModernAdminDashboard;
