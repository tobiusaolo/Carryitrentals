import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Memory as MemoryIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  BugReport as BugReportIcon,
  Update as UpdateIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import adminAPI from '../../services/api/adminAPI';

const AdminSystemHealth = () => {
  const { user } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadSystemHealth();
    }
  }, [user]);

  const loadSystemHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminAPI.getSystemHealth();
      setSystemHealth(data);
      setAlerts(data.alerts || []);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load system health');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'critical': return <ErrorIcon />;
      default: return <SecurityIcon />;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getLogColor = (level) => {
    switch (level) {
      case 'INFO': return 'success';
      case 'WARNING': return 'warning';
      case 'ERROR': return 'error';
      default: return 'default';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You need admin privileges to access this page.</Typography>
        </Alert>
      </Box>
    );
  }

  if (loading && !systemHealth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!systemHealth) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        System Health Monitoring
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Operational health from live payment, maintenance, and booking counts.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* System Status Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  {getStatusIcon(systemHealth.status)}
                </Avatar>
                <Box>
                  <Typography variant="h5">System Status</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall system health
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label={systemHealth.status.toUpperCase()} 
                color={getStatusColor(systemHealth.status)}
                size="large"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <NetworkIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">Active users</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Registered accounts on platform
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h4" color="primary.main">
                {systemHealth.active_users} / {systemHealth.total_users}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Operational Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Pending payments</Typography>
              </Box>
              <Typography variant="h4">{systemHealth.pending_payments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Overdue rent</Typography>
              </Box>
              <Typography variant="h4" color={systemHealth.overdue_payments > 0 ? 'error.main' : 'text.primary'}>
                {systemHealth.overdue_payments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Pending viewings</Typography>
              </Box>
              <Typography variant="h4">{systemHealth.pending_inspections}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BugReportIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">Open maintenance</Typography>
              </Box>
              <Typography variant="h4">{systemHealth.active_maintenance}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts and Logs */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                System Alerts
              </Typography>
              <List>
                {alerts.map((alert) => (
                  <ListItem key={alert.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getAlertColor(alert.severity) + '.main' }}>
                        {alert.type === 'error' ? <ErrorIcon /> : 
                         alert.type === 'warning' ? <WarningIcon /> : <CheckCircleIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={alert.message}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {new Date(alert.timestamp).toLocaleString()}
                          </Typography>
                          <Chip 
                            label={alert.severity} 
                            color={getAlertColor(alert.severity)}
                            size="small" 
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BugReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Logs
              </Typography>
              <List>
                {logs.map((log) => (
                  <ListItem key={log.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getLogColor(log.level) + '.main' }}>
                        {log.level === 'ERROR' ? <ErrorIcon /> : 
                         log.level === 'WARNING' ? <WarningIcon /> : <CheckCircleIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={log.message}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                          <Chip 
                            label={log.level} 
                            color={getLogColor(log.level)}
                            size="small" 
                          />
                          <Chip 
                            label={log.source} 
                            color="default"
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Version: {systemHealth.version}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Manual proofs pending: {systemHealth.pending_manual_proofs}
              </Typography>
            </Grid>
            {!systemHealth.infrastructure_monitored && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  Server CPU, memory, and disk are not monitored in this deployment. Metrics above
                  reflect live business operations from your database.
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminSystemHealth;
