import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
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
  Container,
  Fade
} from '@mui/material';
import {
  TrendingUp,
  People,
  Home,
  Apartment,
  AttachMoney,
  Warning,
  Refresh,
  Business,
  Person,
  Schedule
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../../store/slices/propertySlice';
import adminAPI from '../../services/api/adminAPI';
import EnhancedStatCard from '../../components/UI/EnhancedStatCard';

const ModernAdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(fetchProperties());
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
      setError('Failed to load system overview');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Container sx={{ mt: 4 }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!stats) return <Container sx={{ mt: 4 }}><Alert severity="info">No data available</Alert></Container>;

  return (
    <Box sx={{ pb: 8 }}>
      {/* Premium Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #EEE', pt: 6, pb: 4, mb: 4 }}>
        <Container maxWidth="xl">
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#222', mb: 1 }}>
                System Administration
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Admin" size="small" sx={{ fontWeight: 700, bgcolor: '#F7F7F7', border: '1px solid #DDD' }} />
                <Typography variant="body2" color="text.secondary">
                  Global overview of CarryIT platform health and activity.
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <IconButton onClick={() => loadDashboardData()} sx={{ bgcolor: '#F7F7F7', border: '1px solid #DDD' }}>
                <Refresh />
              </IconButton>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* System Alerts */}
        {systemAlerts.map((alert) => (
          <Alert key={alert.id} severity={alert.type === 'error' ? 'error' : 'warning'} sx={{ mb: 2, borderRadius: '12px' }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{alert.title}</Typography>
            {alert.message}
          </Alert>
        ))}

        {/* Primary Metrics */}
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#222', mb: 2 }}>Platform Statistics</Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <EnhancedStatCard
              title="Total Properties"
              value={stats.overview.total_properties}
              icon={<Home />}
              color="#667eea"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <EnhancedStatCard
              title="Active Tenants"
              value={stats.overview.total_tenants}
              icon={<People />}
              color="#10b981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <EnhancedStatCard
              title="Platform Revenue"
              value={`$${stats.revenue.total_monthly_revenue.toLocaleString()}`}
              icon={<AttachMoney />}
              color="#f59e0b"
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

        {/* System Health & Activity */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #EEE' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Recent Activity</Typography>
              <List>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        <Avatar sx={{ bgcolor: '#F7F7F7', color: '#667eea' }}>
                          <Schedule sx={{ fontSize: 20 }} />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{activity.message}</Typography>}
                        secondary={new Date(activity.timestamp).toLocaleString()}
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #EEE' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>System Health</Typography>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Uptime</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981' }}>{stats.system.uptime}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" value={stats.system.uptime} 
                  sx={{ height: 6, borderRadius: 3, bgcolor: '#EEE', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }}
                />
              </Box>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Response Time</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#667eea' }}>{stats.system.response_time}ms</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" value={Math.max(0, 100 - (stats.system.response_time / 10))} 
                  sx={{ height: 6, borderRadius: 3, bgcolor: '#EEE', '& .MuiLinearProgress-bar': { bgcolor: '#667eea' } }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Error Rate</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#ef4444' }}>{stats.system.error_rate}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" value={stats.system.error_rate * 10} 
                  sx={{ height: 6, borderRadius: 3, bgcolor: '#EEE', '& .MuiLinearProgress-bar': { bgcolor: '#ef4444' } }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ModernAdminDashboard;
